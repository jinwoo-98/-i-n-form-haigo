"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft, Save, Lock, Send, Loader2 } from 'lucide-react';
import { BUDGET_DEFAULT, ROOM_NAMES } from '../../constants/booking';
import { showSuccess, showError } from '../../utils/toast';
import { supabase } from "@/integrations/supabase/client";
import { sendTelegramMessage } from '../../utils/telegram';

interface SettingsViewProps {
  onClose: () => void;
}

const SettingsView = ({ onClose }: SettingsViewProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('tgh_bcfg');
    return saved ? JSON.parse(saved) : { ...BUDGET_DEFAULT };
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        checkAdminRole(session.user.id);
      }
    };
    checkUser();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data && data.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Error checking admin role:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const fetchRemoteConfig = async () => {
        try {
          const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'app_config')
            .maybeSingle();
          
          if (error) throw error;
          
          if (data) {
            setConfig(data.value);
            localStorage.setItem('tgh_bcfg', JSON.stringify(data.value));
          }
        } catch (err: any) {
          console.error("Error fetching config:", err);
          if (err.code === '42501') {
            showError("Bạn không có quyền truy cập cấu hình này!");
          }
        }
      };
      fetchRemoteConfig();
    }
  }, [isAuthenticated, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setIsAuthenticated(true);
      if (data.user) {
        await checkAdminRole(data.user.id);
      }
      showSuccess("Đăng nhập thành công!");
    } catch (err: any) {
      showError("Tài khoản hoặc mật khẩu không chính xác!");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    onClose();
  };

  const handleSave = async () => {
    if (!isAdmin) {
      showError("Chỉ quản trị viên mới có quyền lưu thay đổi!");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          key: 'app_config', 
          value: config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      localStorage.setItem('tgh_bcfg', JSON.stringify(config));
      showSuccess("Đã lưu cài đặt!");
      onClose();
    } catch (err: any) {
      if (err.code === '42501') {
        showError("Bạn không có quyền thay đổi cài đặt này!");
      } else {
        showError("Lỗi khi lưu dữ liệu!");
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setIsTesting(true);
    const now = new Date().toLocaleString('vi-VN');
    const testMessage = `<b>🛠️ KIỂM TRA KẾT NỐI</b>\n✅ Trạng thái: Hoạt động tốt\n🕒 Thời gian: ${now}`;
    
    const success = await sendTelegramMessage(testMessage);
    if (success) {
      showSuccess("Gửi tin nhắn thử thành công!");
    } else {
      showError("Gửi thất bại. Vui lòng kiểm tra lại quyền hạn.");
    }
    setIsTesting(false);
  };

  const updateVal = (room: string, idx: number, val: string) => {
    const newConfig = { ...config };
    newConfig[room][idx] = parseFloat(val) || 0;
    setConfig(newConfig);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-[32px] shadow-2xl border border-[#EDE8DF] p-12 text-center">
        <div className="w-16 h-16 bg-[#F9F6F0] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-[#3D5A45]" />
        </div>
        <h2 className="text-2xl font-bold text-[#2C2824] mb-2">Quản trị hệ thống</h2>
        <p className="text-[14px] text-[#8C8070] mb-8">Đăng nhập để quản lý cấu hình</p>
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-2">
            <Label className="text-[12px] font-bold text-[#5C544A]">Email quản trị</Label>
            <Input 
              type="email" 
              placeholder="admin@sconcept.vn" 
              className="h-12 bg-[#F9F6F0] border-[#D5CEC3] rounded-xl focus:ring-[#3D5A45]/20 focus:border-[#3D5A45]"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[12px] font-bold text-[#5C544A]">Mật khẩu</Label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="h-12 bg-[#F9F6F0] border-[#D5CEC3] rounded-xl focus:ring-[#3D5A45]/20 focus:border-[#3D5A45]"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-14 bg-[#3D5A45] hover:bg-[#2d4333] text-white rounded-2xl font-bold shadow-lg shadow-[#3D5A45]/20 transition-all active:scale-95 mt-4"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Đăng nhập"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} className="w-full text-[#8C8070] hover:text-[#2C2824] hover:bg-transparent">
            Quay lại
          </Button>
        </form>
      </div>
    );
  }

  if (isAuthenticated && !isAdmin && !isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-[32px] shadow-2xl border border-[#EDE8DF] p-12 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#2C2824] mb-2">Từ chối truy cập</h2>
        <p className="text-[14px] text-[#8C8070] mb-8">Tài khoản của bạn không có quyền quản trị.</p>
        <Button onClick={handleLogout} className="w-full h-14 bg-[#3D5A45] text-white rounded-2xl font-bold">
          Đăng xuất
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#EDE8DF] p-10">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-[#8C8070]" />
          </Button>
          <h2 className="text-2xl font-bold text-[#2C2824]">Cấu hình</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl px-4 border-[#D5CEC3] text-[#8C8070]" onClick={handleLogout}>
            Đăng xuất
          </Button>
          <Button className="bg-[#3D5A45] hover:bg-[#2d4333] text-white rounded-xl px-6" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu
          </Button>
        </div>
      </div>

      <div className="space-y-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#3D5A45] font-bold text-[13px] uppercase tracking-wider">
              <Send className="w-4 h-4" /> Thông báo Telegram
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-[11px] font-bold border-[#D5CEC3] text-[#8C8070] hover:bg-[#E8F0EA] hover:text-[#3D5A45] hover:border-[#3D5A45] rounded-lg transition-all"
              onClick={handleTestTelegram}
              disabled={isTesting}
            >
              {isTesting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />} Gửi thử
            </Button>
          </div>
          <div className="p-6 bg-[#F9F6F0] rounded-2xl border border-[#D5CEC3]">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#3D5A45]/10 p-2 rounded-full">
                <Lock className="w-4 h-4 text-[#3D5A45]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#2C2824]">Bảo mật hệ thống</p>
                <p className="text-[12px] text-[#8C8070] mt-1 leading-relaxed">
                  Chế độ RBAC đang hoạt động. Chỉ tài khoản có vai trò 'admin' trong bảng profiles mới có thể thay đổi các thông số này.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-[#3D5A45] font-bold text-[13px] uppercase tracking-wider">Ngân sách (Triệu VNĐ)</div>
          <div className="overflow-x-auto border border-[#EDE8DF] rounded-2xl">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#F9F6F0]">
                <tr>
                  <th className="p-4 font-bold text-[#8C8070]">Loại căn</th>
                  <th className="p-4 font-bold text-[#8C8070]">Vài món</th>
                  <th className="p-4 font-bold text-[#8C8070]">Theo phòng</th>
                  <th className="p-4 font-bold text-[#8C8070]">Trọn bộ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE8DF]">
                {Object.keys(ROOM_NAMES).map((id) => (
                  <tr key={id}>
                    <td className="p-4 font-bold text-[#5C544A]">{ROOM_NAMES[id]}</td>
                    {[0, 1, 2].map(idx => (
                      <td key={idx} className="p-2">
                        <Input 
                          type="number" 
                          className="h-9 text-right border-[#D5CEC3] rounded-lg" 
                          value={(config as any)[id]?.[idx] || 0} 
                          onChange={e => updateVal(id, idx, e.target.value)} 
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
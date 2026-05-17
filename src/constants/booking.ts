export const BUDGET_DEFAULT = {
  studio: [15, 35, 60],
  '1pn': [25, 55, 100],
  '2pn': [40, 90, 170],
  '3pn': [60, 140, 280],
  townhouse: [100, 250, 500],
  other: [30, 80, 200],
  hmMult: 0.7
};

export const ROOM_NAMES: Record<string, string> = {
  studio: 'Studio',
  '1pn': '1 Phòng ngủ',
  '2pn': '2 Phòng ngủ',
  '3pn': '3 Phòng ngủ',
  townhouse: 'Nhà phố',
  other: 'Khác'
};

export const STAGES = [
  { id: 'explore', icon: '🔍', title: 'Đang tìm hiểu', desc: 'Chưa biết chọn gì, cần tư vấn phong cách + ngân sách', inc: '→ Video call 15 phút miễn phí' },
  { id: 'design', icon: '📐', title: 'Có ý tưởng rồi', desc: 'Có bản vẽ hoặc ảnh, cần thiết kế layout + báo giá', inc: '→ AI Layout + Video call tư vấn' },
  { id: 'render', icon: '🎨', title: 'Muốn xem phối cảnh', desc: 'Đã chọn SP, muốn xem render 3D trong phòng thật', inc: '→ Render 3D + Video 3D phối cảnh' },
  { id: 'order', icon: '✅', title: 'Sẵn sàng đặt hàng', desc: 'Đã quyết định, cần báo giá chính thức + hợp đồng', inc: '→ Báo giá combo + Hợp đồng' }
];

export const PURPOSES = [
  { id: 'live', icon: '🏡', title: 'Mua để ở', desc: 'Tổ ấm lâu dài, đầu tư chất lượng' },
  { id: 'homestay', icon: '🏨', title: 'Homestay / Cho thuê', desc: 'Đẹp chụp ảnh, bền, thu hồi vốn nhanh' }
];

export const CONSULT_TYPES = [
  { id: 'video', icon: '📹', title: 'Video call', desc: 'Zoom / Google Meet linh hoạt' },
  { id: 'showroom', icon: '🏬', title: 'Tại showroom', desc: 'Xem đồ thật, trải nghiệm chất liệu' },
  { id: 'flexible', icon: '💬', title: 'Linh hoạt', desc: 'Để VŨ GIA sắp xếp giúp' }
];

export const SLOT_DURATION: Record<string, number> = {
  explore: 15,
  design: 30,
  render: 30,
  order: 15
};

export const PEAK_HOURS = ['10:00', '10:30', '14:00', '14:30', '19:00', '19:30', '20:00'];
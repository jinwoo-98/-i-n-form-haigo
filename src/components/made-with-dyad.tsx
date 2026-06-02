export const MadeWithDyad = () => {
  return (
    // TỐI ƯU MOBILE: Giảm py từ p-4 (16px) xuống py-1 (4px) trên mobile để tăng tối đa chiều cao khung chính
    <div className="py-1 md:py-3 px-4 text-center">
      {/* TỐI ƯU MOBILE: Giảm kích thước chữ từ text-sm xuống text-[11px] tinh tế hơn, nhường chỗ cho form chính */}
      <p className="text-[11px] md:text-sm text-[#8C8070] font-medium leading-none">
        © {new Date().getFullYear()} HAIGO - Thiết Kế & Thi Công Nội Thất Gỗ
      </p>
    </div>
  );
};
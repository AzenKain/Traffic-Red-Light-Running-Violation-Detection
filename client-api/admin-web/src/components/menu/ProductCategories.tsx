"use client";
export default function ProductCategories() {
    const categories = [
        { name: "Chúc Mừng 8/3", img: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" },
        { name: "Đồ Chơi Mô Hình", img: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" },
        { name: "Đèn Chống Cận", img: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" },
        { name: "Đam Mỹ", img: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" },
        { name: "Kinh Tế", img: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" },
        { name: "Văn Học", img: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" },
        { name: "Tâm Lý Kỹ Năng", img: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" },
        { name: "Thiếu Nhi", img: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" },
        { name: "Sách Học Ngoại Ngữ", img: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" },
        { name: "Ngoại Văn", img: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" }
    ];

    return (
        <div className="bg-gray-100 rounded-lg shadow-md my-2 p-6">
            <div className="flex items-center mb-4">
                <span className="text-red-500 text-2xl mr-2">▥</span>
                <h2 className="font-bold text-xl">Danh mục sản phẩm</h2>
            </div>
            <hr className="border-t border-gray-300 mb-4" />
            <div className="grid grid-cols-10 gap-4 text-center">
                {categories.map((cat, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <img src={cat.img} alt={cat.name} className="w-24 h-24 object-contain rounded-lg shadow" />
                        <p className="mt-2 text-sm font-semibold text-gray-700">{cat.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

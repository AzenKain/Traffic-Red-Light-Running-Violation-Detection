export default function BestsellerChart() {
    const books = [
        {
            rank: '01',
            title: 'Trường Ca Achilles',
            author: 'Madeline Miller',
            points: 1494,
            price: '124,800 đ',
            oldPrice: '156,000 đ',
            discount: '-20%',
            img: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
            desc: 'Hy Lạp vào thời hoàng kim của các anh hùng...'
        },
        {
            rank: '02',
            title: 'Người Đàn Ông Mang Tên OVE (Tái Bản)',
            author: 'Fredrik Backman',
            points: 1445,
            price: '150,000 đ',
            oldPrice: '180,000 đ',
            discount: '-17%',
            img: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
            desc: 'Câu chuyện về một người đàn ông cô đơn...'
        },
        {
            rank: '03',
            title: 'Lớp Có Tang Sự Không Cần Điểm Danh',
            author: 'Doo Vandenis',
            points: 1049,
            price: '198,750 đ',
            oldPrice: '265,000 đ',
            discount: '-25%',
            img: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
            desc: 'Những bí mật được giấu kín...'
        },
        {
            rank: '04',
            title: 'Hai Số Phận - Bìa Cứng (Tái Bản 2023)',
            author: 'Jeffrey Archer',
            points: 1023,
            price: '220,000 đ',
            oldPrice: '275,000 đ',
            discount: '-20%',
            img: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
            desc: 'Câu chuyện về hai con người...'
        },
        {
            rank: '05',
            title: 'Tiệm Sách Của Nàng',
            author: 'Nguyễn Nhật Ánh',
            points: 990,
            price: '90,000 đ',
            oldPrice: '100,000 đ',
            discount: '-10%',
            img: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
            desc: 'Câu chuyện tình yêu nhẹ nhàng...'
        }
    ];

    return (
        <div className="bg-base-200 shadow-lg p-6 rounded-lg">
            <h2 className="bg-base-300 w-full p-2 font-bold text-lg mb-4 text-center">Bảng xếp hạng bán chạy tuần</h2>
            <div className="tabs border-b mb-4 flex justify-center">
                <a className="tab tab-bordered tab-active text-red-500">Văn học</a>
                <a className="tab tab-bordered">Kinh tế</a>
                <a className="tab tab-bordered">Tâm lý - Kỹ năng sống</a>
                <a className="tab tab-bordered">Thiếu nhi</a>
                <a className="tab tab-bordered">Sách học ngoại ngữ</a>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className='grid grid-rows-5 gap-2'>
                    {books.map((book, idx) => (
                        <div key={idx} className="flex items-center border-b bg-amber-50 border-gray-300 rounded-lg py-4">
                            <span className="text-green-600 font-bold w-10 text-center">{book.rank}</span>
                            <img src={book.img} alt={book.title} className="w-20 h-28 rounded-lg mr-4" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-md">{book.title}</h3>
                                <p className="text-sm text-gray-500">{book.author}</p>
                                <p className="text-blue-500">{book.points} điểm</p>
                                <div className="text-red-500 font-bold">
                                    {book.price} <span className="line-through text-gray-400 text-sm">{book.oldPrice}</span>
                                    <span className="bg-yellow-400 text-xs p-1 rounded ml-2">{book.discount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-l border-gray-300 pl-6 flex flex-col items-center">
                    <img src={books[0].img} alt={books[0].title} className="w-48 h-64 object-cover rounded-lg mb-4" />
                    <h3 className="font-bold text-xl mb-2">{books[0].title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{books[0].author}</p>
                    <div className="text-red-500 font-bold mb-2">
                        {books[0].price} <span className="line-through text-gray-400 text-sm">{books[0].oldPrice}</span>
                        <span className="bg-yellow-400 text-xs p-1 rounded ml-2">{books[0].discount}</span>
                    </div>
                    <p className="text-sm text-gray-600 text-center">{books[0].desc}</p>
                </div>
            </div>
            <div className="text-center mt-6">
                <button className="btn btn-outline text-red-500 border-red-500 hover:bg-red-500 hover:text-white">
                    Xem thêm
                </button>
            </div>
        </div>
    );
}

"use client"
import { useChangeTheme } from "@/hooks/useChangeTheme";
import Link from "next/link";


const items = [
    { label: "Winter" },
    { label: "Night" },
    { label: "Cupcake" },
    { label: "Coffee" },
];

export default function Header() {
    const { changeTheme } = useChangeTheme()

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li><a>Item 1</a></li>
                        <li>
                            <a>Parent</a>
                            <ul className="p-2">
                                <li><a>Submenu 1</a></li>
                                <li><a>Submenu 2</a></li>
                            </ul>
                        </li>
                        <li><a>Item 3</a></li>
                    </ul>
                </div>
                <a className="btn btn-ghost gap-0 text-[#8DC496] no-underline hover:no-underline font-bold text-3xl">
                    Ka
                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-orange-500 to-red-500">
                        in
                    </span>
                </a>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <Link href={'/'}><a>Kiểm tra camera</a></Link>
                    <Link href={'/'}><a>Thiệt lập hệ thống</a></Link>
                    <li><a>Phương tiện phạm lỗi</a></li>
                </ul>
            </div>
            <div className="navbar-end gap-2">
                <div title="Change Theme" className="dropdown dropdown-end block ">
                    <div tabIndex={0} role="button" className="btn btn-ghost">
                        <svg
                            width={20}
                            height={20}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="h-5 w-5 stroke-current md:hidden"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                            />
                        </svg>{" "}
                        <span className="hidden font-normal md:inline">Theme</span>{" "}
                        <svg
                            width="12px"
                            height="12px"
                            className="hidden h-2 w-2 fill-current opacity-60 sm:inline-block"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 2048 2048"
                        >
                            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
                        </svg>
                    </div>{" "}
                    <div
                        tabIndex={0}
                        className="dropdown-content bg-base-200 text-base-content rounded-box top-px  overflow-y-auto border border-white/5 shadow-2xl outline-1 outline-black/5 mt-16"
                    >
                        <ul className="menu w-48">
                            {items.map((i) => (
                                <li
                                    key={i.label}
                                    onClick={() => {
                                        if (changeTheme) changeTheme(i.label.toLowerCase());
                                    }}
                                >
                                    <button
                                        className="gap-3 px-2"
                                        data-set-theme={i.label.toLowerCase()}
                                        data-act-class="[&_svg]:visible"
                                    >
                                        <div
                                            data-theme={i.label.toLowerCase()}
                                            className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
                                        >
                                            <div className="bg-base-content size-1 rounded-full" />{" "}
                                            <div className="bg-primary size-1 rounded-full" />{" "}
                                            <div className="bg-secondary size-1 rounded-full" />{" "}
                                            <div className="bg-accent size-1 rounded-full" />
                                        </div>{" "}
                                        <div className="w-32 truncate">{i.label.toLowerCase()}</div>{" "}

                                    </button>
                                </li>
                            ))}


                        </ul>
                    </div>
                </div>
                <Link className='btn btn-ghost btn-circle' href={"https://github.com/TLUAI220/Loan-Predict-Group-4"}>
                    <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" /></svg>
                </Link>
            </div>
        </div>
    )
}
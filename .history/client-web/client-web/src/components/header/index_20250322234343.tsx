"use client"
import { useChangeTheme } from "@/hooks/useChangeTheme";


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

                <a className="btn btn-ghost text-xl">
                    {/* <Image
                        src={"/logo.png"}
                        alt={"logo"}
                        height={200}
                        width={200}
                        className="w-fit h-full object-contain"
                    /> */}
                    Client Web
                </a>
            </div>
            <div className="navbar-center hidden lg:flex">
                <label className="input w-96">
                    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                    <input type="search" required placeholder="Search"/>
                </label>
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

            </div>
        </div>
    )
}
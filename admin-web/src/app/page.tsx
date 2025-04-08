'use client'
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const userData = useAppSelector((state) => state.UserRedux.value)
  const dispatch = useAppDispatch()
  return (
    <>
      <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        
        <Breadcrumb pageName="Profile" />

        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center my-3 text-black dark:text-white text-4xl font-semibold">Welcome {userData.username} to GLAMIFY Admin</div>

          <div className="relative z-20 h-35 md:h-65">
            <Image
              src={"/images/cover/cover-01.png"}
              alt="profile cover"
              className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
              width={970}
              height={260}
              style={{
                width: "auto",
                height: "auto",
              }}
            />
          </div>
          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
            <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
              <div className="relative drop-shadow-2">
                <Image
                  src={userData?.imgDisplay ?? "/images/user/user-01.png"}
                  width={160}
                  height={160}
                  style={{
                    width: "auto",
                    height: "auto",
                  }}
                  alt="profile"
                  className="rounded-full"
                />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                {userData?.username}
              </h3>
              <p className="font-medium">{userData?.role?.map((r) => r).join(", ")}</p>
            </div>
          </div>
        </div>
      </div>

      </DefaultLayout>
    </>
  );
}

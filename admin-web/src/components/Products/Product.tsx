'use client'
import Image from "next/image";
import { Camera, Violation } from "@/types/product";
import { ChangeEvent, useEffect, useState } from "react";
import { makeRequestApi, addProductApi, getAllProductApi, editProductApi, deleteProductApi, genKeyProductApi } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { AddListProduct, AddProduct, RemoveProduct, SearchProduct } from "@/app/redux/features/product/product.redux";
import { deleteProductDto } from "@/lib/dtos/product/deleteProduct.dto";
import { addProductDto } from "@/lib/dtos/product/addProduct.dto";
import { editProductDto } from "@/lib/dtos/product/editProduct.dto";
import { format } from 'date-fns';

const ProductBox = () => {
  const { data: session } = useSession()
  const productList = useAppSelector((state) => state.ProductRedux.value)
  const dispatch = useAppDispatch()
  const [productSelect, setProductSelect] = useState<Camera | null>(null);
  const [typeForm, setTypeForm] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("all");
  const [groupedViolations, setGroupedViolations] = useState<{ [key: string]: Violation[] }>();

  const handleSearch = () => {
    dispatch(SearchProduct({ value: searchValue, filter: searchFilter }))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseData: Camera[] = await makeRequestApi(getAllProductApi, null, session?.refresh_token, session?.access_token);

        if (responseData) {
          dispatch(AddListProduct(responseData));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch])


  const [address, setAddress] = useState<string>("");
  const [imgDisplay, setImgDisplay] = useState<string>("");
  const [token, setToken] = useState<string>("");

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };

  const handleImgDisplayChange = (data: string) => {
    setImgDisplay(data);
  };

  const handleShow = (key: number, model: string, type: string) => {
    const modal = document.getElementById(model) as HTMLDialogElement | null;

    if (key !== -1 && productList[key]) {
      const product = productList[key];
      setAddress(product?.address || '');
      setImgDisplay(product?.imgDisplay || '');

    } else {
      setAddress('');;
      setImgDisplay('');
    }

    if (modal) {
      modal.showModal();
      setTypeForm(type)
      setProductSelect(productList[key])
      const grouped = productList[key]?.violations?.reduce((acc, violation) => {
        const date = format(new Date((violation?.time ?? 0) * 1000), 'dd/MM/yyyy');
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(violation);
        return acc;
      }, {} as { [key: string]: Violation[] });

      setGroupedViolations(grouped);
    }
  }

  const handleDeleteProduct = async (model: string) => {
    let dataReturn = null;
    const selectedProduct = productSelect;
    if (!selectedProduct || !selectedProduct._id) return;
    let dto: deleteProductDto = {
      productId: selectedProduct._id,
    }
    dataReturn = await makeRequestApi(deleteProductApi, dto, session?.refresh_token, session?.access_token);
    if (dataReturn !== null) {
      const modal = document.getElementById(model || '') as HTMLDialogElement | null;
      if (modal) {
        modal.close();
        dispatch(RemoveProduct(selectedProduct._id))
      }
    }
  }
  const handleCopyToken = () => {
    const tokenInput = document.getElementById("tokenInput");
    if (tokenInput) {
      navigator.clipboard.writeText((tokenInput as HTMLInputElement)?.value)
        .then(() => {
          alert("Token copied to clipboard!");
        })
        .catch((error) => {
          console.error("Failed to copy token: ", error);
          alert("Failed to copy token!");
        });
    }
  };

  const handleGenerateToken = async () => {
    let dto: editProductDto = {
      productId: productSelect?._id || "",
    }
    const data = await makeRequestApi(genKeyProductApi, dto, session?.refresh_token, session?.access_token);
    if (data) {
      const base64String = data.key || '';

      const decodedString = atob(base64String);

      try {
        const jsonObject = JSON.parse(decodedString);
        setToken(data.key || '');
        if (productSelect) {

          const updatedProductSelect = { ...productSelect, key: jsonObject.key || '' };
          dispatch(AddProduct(updatedProductSelect));
        }
      } catch (error) {
        console.error("Failed to parse decoded string as JSON", error);
      }
    }
  }

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>, model: string) => {
    event.preventDefault();
    let dataReturn = null;
    if (typeForm === "CREATE") {
      let dto: addProductDto = {
        address: address,
        imgDisplay: imgDisplay,
      }
      dataReturn = await makeRequestApi(addProductApi, dto, session?.refresh_token, session?.access_token);
    }
    else if (typeForm == "EDIT") {
      let dto: editProductDto = {
        productId: productSelect?._id || "",
        address: address,
        imgDisplay: imgDisplay,
      }
      dataReturn = await makeRequestApi(editProductApi, dto, session?.refresh_token, session?.access_token);
    }
    if (dataReturn !== null) {
      const modal = document.getElementById(model) as HTMLDialogElement | null;
      if (modal) {
        modal.close();
        dispatch(AddProduct(dataReturn))
      }
    }
  }

  return (
    <div className="flex flex-col gap-10 mt-2">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex w-full">
          <input
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            type="text"
            placeholder="Search for the tool you like"
            className="w-full text-black dark:text-white  px-3 h-10 rounded-l border-2 border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          />
          <button
            onClick={() => handleSearch()}
            type="submit"
            className="bg-sky-500 text-black dark:text-white rounded-r px-2 md:px-3 py-0 md:py-1"
          >
            Search
          </button>
        </div>
        <select
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          id="pricingType"
          name="pricingType"
          className="h-10 border-2 border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark text-black dark:text-white rounded px-2 md:px-3 py-0 md:py-1 tracking-wider"
        >
          <option value="all">All</option>
          <option value="_id">Id</option>
          <option value="address">Address</option>
        </select>
      </div>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">

        <div className="flex justify-between px-4 py-6 md:px-6 xl:px-7.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Camera List
          </h4>
          <button onClick={() => handleShow(-1, "my_modal_control", "CREATE")} aria-label="Submit" className="btn btn-info w-26 h-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Thêm
          </button>
        </div>

        <div className="grid grid-cols-8 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
          <div className="col-span-2 flex items-center">
            <p className="font-medium">Id</p>
          </div>
          <div className="col-span-2 flex items-center">
            <p className="font-medium">Address</p>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="font-medium">imgDisplay</p>
          </div>
          <div className="col-span-2 flex items-center">
            <p className="font-medium">Controller</p>
          </div>
        </div>

        {productList.map((product, key) => (
          <div
            className="grid grid-cols-8 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
            key={key}
          >
            <div className="col-span-2 flex items-center">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <p className="text-sm text-black dark:text-white truncate">
                  {product?._id}
                </p>
              </div>
            </div>
            <div className="col-span-2 flex items-center">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <p className="text-sm text-black dark:text-white">
                  {product?.address}
                </p>
              </div>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <div className="h-[50px] w-[60px] rounded-md overflow-hidden">
                <Image
                  src={product?.imgDisplay || "/images/product/product-01.png"}
                  width={60}
                  height={50}
                  alt="Product"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-1">
              <div className="dropdown dropdown-bottom dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-info m-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
                >
                  <li>
                    <a onClick={() => handleShow(key, "my_modal_view", "VIEW")} >View detail camera</a>
                  </li>
                  <li>
                    <a onClick={() => handleShow(key, "my_modal_log", "VIEW")} >View violations</a>
                  </li>
                </ul>
              </div>

              <div className="dropdown dropdown-bottom dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn  btn-success m-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
                >
                  <li>
                    <a onClick={() => handleShow(key, "my_modal_control", "EDIT")} >Edit camera</a>
                  </li>
                  <li>
                    <a onClick={() => handleShow(key, "my_modal_token", "EDIT")} >Generative token</a>
                  </li>
                </ul>
              </div>
              <button aria-label="Submit" onClick={() => handleShow(key, "my_modal_delete", "DELETE")} className="btn btn-error">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        <dialog id="my_modal_view" className="modal">
          <div className="modal-box w-11/12 max-w-5xl bg-white dark:bg-boxdark rounded-lg shadow-lg p-0 overflow-scroll">
            <form method="dialog" className="sticky top-0 z-[20]">
              <button className="btn btn-sm btn-circle absolute right-3 top-3 bg-rose-100 hover:bg-rose-200 dark:bg-rose-700 dark:hover:bg-rose-600 border-none text-gray-500 dark:text-gray-300 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>

            <div className="flex flex-col md:flex-row">
              {/* Image section */}
              <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800 p-6 flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-lg shadow-md">
                  <Image
                    layout="fill"
                    objectFit="contain"
                    src={productSelect?.imgDisplay || "/images/product/product-01.png"}
                    alt={`Product Image`}
                    className="transition-transform hover:scale-105 duration-300"
                  />
                </div>

              </div>

              {/* Content section */}
              <div className="w-full md:w-1/2 p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4 pb-3 border-b border-stroke dark:border-strokedark">
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-1">Camera Details</h2>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Camera ID</span>
                      <span className="font-medium text-black dark:text-white">{productSelect?._id || "N/A"}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Address</span>
                      <span className="font-medium text-black dark:text-white">{productSelect?.address || "N/A"}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Key</span>
                      <span className="font-medium text-black dark:text-white">{productSelect?.key || "N/A"}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </dialog>

        <dialog id="my_modal_log" className="modal">
          <div className="modal-box w-11/12 max-w-5xl bg-white dark:bg-boxdark rounded-lg shadow-lg p-0 overflow-scroll">
            <form method="dialog" className="sticky top-0 z-[20]">
              <button className="btn btn-sm btn-circle absolute right-3 top-3 bg-rose-100 hover:bg-rose-200 dark:bg-rose-700 dark:hover:bg-rose-600 border-none text-gray-500 dark:text-gray-300 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>

            <div className="m-4">
              <h1 className="text-2xl font-bold mb-4">Bảng Vi Phạm Giao Thông</h1>

              {groupedViolations && Object.entries(groupedViolations).map(([date, dayViolations]) => (
                <div key={date} className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Ngày: {date}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayViolations.map(violation => (
                      <div
                        key={violation.id}
                        className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Biển Số: {violation.plate_text}</span>
                          <span className="text-gray-600">
                            TG: {format(new Date((violation.time ?? 0) * 1000), 'HH:mm:ss')}
                          </span>

                        </div>
                        <div className="text-gray-700">Loại phương tiện: {violation.vehicle_type}</div>

                        <div className="grid grid-cols-2 gap-2">
                          {violation.vehicle_image && (
                            <div>
                              <p className="text-sm mb-1">Hình Xe:</p>
                              <Image
                                src={violation.vehicle_image}
                                alt="Hình xe vi phạm"
                                width={200}
                                height={150}
                                className="rounded-md"
                              />
                            </div>
                          )}

                          {violation.plate_image && (
                            <div>
                              <p className="text-sm mb-1">Hình Biển Số:</p>
                              <Image
                                src={violation.plate_image}
                                alt="Hình biển số vi phạm"
                                width={200}
                                height={150}
                                className="rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </dialog>

        <dialog id="my_modal_control" className="modal ">
          <div className="modal-box w-11/12 max-w-5xl">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <form method="dialog" className="sticky top-0 z-[20]">
                <button className="btn btn-circle btn-error btn-md absolute right-2 top-2 rounded-full border border-stroke text-xl">
                  ✕
                </button>
              </form>
              <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Camera Form
                </h3>
              </div>
              <form onSubmit={async (e) => await handleAddProduct(e, "my_modal_control",)}>
                <div className="p-6.5">

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Address<span className="text-meta-1">*</span>
                    </label>
                    <input
                      value={address}
                      onChange={handleAddressChange}
                      type="text"
                      placeholder="Enter the name"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      imgDisplay <span className="text-meta-1">*</span>
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files ? e.target.files[0] : null;
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target && typeof event.target.result === 'string') {
                                const base64String = event.target.result;
                                handleImgDisplayChange(base64String);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                    {imgDisplay && (
                      <div className="mt-2">
                        <img src={imgDisplay} alt="Preview" className="max-h-40 rounded" />
                      </div>
                    )}
                  </div>

                  <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                    {typeForm}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </dialog>

        <dialog id="my_modal_delete" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <p className="py-1 text-3xl text-rose-500">Do you want to remove this product?</p>

            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
              <button onClick={() => handleDeleteProduct("my_modal_delete")} className="btn btn-error">Delete</button>
            </div>
          </div>
        </dialog>

        <dialog id="my_modal_token" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <p className="py-1 text-3xl text-rose-500">Generate and Copy Token</p>

            <div className="py-3">
              <label htmlFor="tokenInput" className="block text-lg font-medium text-gray-700">Token</label>
              <input
                id="tokenInput"
                type="text"
                className="input input-bordered w-full"
                value={token} // Assume `token` is the state or variable for the generated token
                readOnly
              />
            </div>

            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
              <button onClick={() => handleCopyToken()} className="btn btn-primary">
                Copy
              </button>
              <button onClick={() => handleGenerateToken()} className="btn btn-success">
                Generate
              </button>
            </div>
          </div>
        </dialog>

      </div>
    </div>
  );
};


export default ProductBox;
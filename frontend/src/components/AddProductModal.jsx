import { useProductStore } from "../store/useProductStore"
import { DollarSignIcon, ImageIcon, Package2Icon, PlusCircleIcon } from "lucide-react";

function AddProductModal() {
    const { createProduct, formData, setFormData, loading } = useProductStore();

    return (
        <dialog id="add_product_modal" className="modal">
            <div className="modal-box">
                {/* Close button */}
                <button className="btn btn-sm btn-cirle btn-ghost absolute right-2 top-2" onClick={() => document.getElementById("add_product_modal").close()}>X</button>

                {/* Modal header */}
                <h3 className="font-bold text-xl mb-8">Add new product</h3>

                <form onSubmit={createProduct} className="space-y-6">
                    <div className="grid gap-6">
                        {/* Product name input */}
                        <div className="form-control">
                            <label htmlFor="product-name" className="label">
                                <span className="label-text text-base font-medium">Product Name</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                    <Package2Icon className="size-5" />
                                </div>
                                <input type="text" placeholder="Enter product name" name="product-name" id="product-name" className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors duration-200" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                        </div>

                        {/* Product price input */}
                        <div className="form-control">
                            <label htmlFor="product-price" className="label">
                                <span className="label-text text-base font-medium">Price</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                    <DollarSignIcon className="size-5" />
                                </div>
                                <input type="number" min="0" step="0.01" placeholder="0.00" name="product-price" id="product-price" className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors duration-200" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                        </div>

                        {/* Product image */}
                        <div className="form-control">
                            <label htmlFor="product-image" className="label">
                                <span className="label-text text-base font-medium">Image URL</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                    <ImageIcon className="size-5" />
                                </div>
                                <input type="text" placeholder="https://example.com/image.jpg" id="product-image" name="product-image" className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors duration-200" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Modal actions */}
                    <div className="modal-action">
                        <button type="submit" className="btn btn-primary min-w-[120px]" disabled={!formData.name || !formData.image || !formData.price || loading }> {loading ? (<span className="loading loading-spinner loading-sm" />):(<> <PlusCircleIcon className="size-5 mr-2"/> Add Product </>)} </button>
                    </div>
                </form>
            </div>

            {/* Backdrop */}
            <button className="modal-backdrop" onClick={() => document.getElementById("add_product_modal").close()}>Close</button>
        </dialog>
    )
}

export default AddProductModal

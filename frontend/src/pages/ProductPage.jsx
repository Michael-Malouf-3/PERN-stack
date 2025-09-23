import { useNavigate, useParams } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useEffect } from "react";
import { ArrowLeftIcon, SaveIcon, Trash2Icon } from "lucide-react";

function ProductPage() {
    const { currentProduct, formData, setFormData, loading, error, fetchProduct, updateProduct, deleteProduct } = useProductStore();
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProduct(id);
    }, [fetchProduct, id]);

    const handleDelete = async () => {
        if(window.confirm("Are you sure you want to delete this product?")){
            await deleteProduct(id);
            navigate("/");
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="alert alert-error">{error}</div>
            </div>
        );
    }


    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button className="btn btn-ghost mb-8" onClick={() => navigate("/")}>
                <ArrowLeftIcon className="size-5 mr-2" />
                Back to Products
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="rounded-lg overflow-hidden shadow-lg bg-base-100">
                    <img src={currentProduct?.image} alt={currentProduct?.name} className="size-full object-cover"/>
                </div>

                {/* Product Form */}
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-6">Edit Product</h2>

                        <form onSubmit={(e) => { e.preventDefault(); updateProduct(id); }} className="space-y-6">
                            {/* Product name */}
                            <div className="form-control">
                                <label htmlFor="product-name" className="label">
                                    <span className="label-text text-base font-medium">Product Name</span>
                                </label>
                                <input type="text" id="product-name" name="product-name" placeholder="Enter product name" className="input input-bordered w-full" value={formData.name} onChange={(e) => setFormData({ ...formData, name : e.target.value})} />
                            </div>

                            {/* Product price */}
                            <div className="form-control">
                                <label htmlFor="product-price" className="label">
                                    <span className="label-text text-base font-medium">Price</span>
                                </label>
                                <input type="number" min="0" step="0.01" id="product-price" name="product-price" placeholder="0.00" className="input input-bordered w-full" value={formData.price} onChange={(e) => setFormData({ ...formData, price : e.target.value})} />
                            </div>

                            {/* Product image */}
                            <div className="form-control">
                                <label htmlFor="product-img" className="label">
                                    <span className="label-text text-base font-medium">Image URL</span>
                                </label>
                                <input type="text" id="product-img" name="product-img" placeholder="https://example.com/image.jpg" className="input input-bordered w-full" value={formData.image} onChange={(e) => setFormData({ ...formData, image : e.target.value})} />
                            </div>

                            {/* Form actions */}
                            <div className="flex justify-between mt-8">
                                <button className="btn btn-error" type="button" onClick={handleDelete}>
                                    <Trash2Icon className="size-4 mr-2" />
                                    Delete Product
                                </button>

                                <button className="btn btn-primary" type="submit" disabled={loading || !formData.name || !formData.price || !formData.image}>
                                    {loading ? (<span className="loading loading-spinner loading-sm"></span>) : (<><SaveIcon className="size-4 mr-2" /> Save Changes </>)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductPage
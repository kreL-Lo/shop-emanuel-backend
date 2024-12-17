import wooCommerceApi from "../../apiSetup/wooCommerceApi";


export const getAllProducts = async (productsIds: string[]) => {
  try {
    const products = await wooCommerceApi.get('products', {
      params: {
        include: productsIds.join(','),
      }
    });
    return products.data;
  } catch (error) {
    console.error('Error getting products:', error);
    throw new Error('Failed to get products');
  }
}

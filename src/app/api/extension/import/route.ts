import { NextResponse } from 'next/server';
import { saveMinimalProduct } from '@/app/admin/actions';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-extension-token');
    const expectedToken = process.env.EXTENSION_SECRET_TOKEN || 'curvygirls-secret-123';
    
    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized: Invalid extension token.' }, { status: 401 });
    }

    const body = await req.json();
    
    const { title, price, description, images, url } = body;
    
    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    let storeName = 'Imported';
    try {
      if (url) {
        const hostname = new URL(url).hostname.replace('www.', '');
        storeName = hostname.split('.')[0];
        storeName = storeName.charAt(0).toUpperCase() + storeName.slice(1);
      }
    } catch(e) {}

    // Convert JSON to FormData to reuse saveMinimalProduct logic
    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price || '0');
    formData.append('description', description || '');
    formData.append('affiliateUrl', url || '');
    formData.append('storeName', storeName);
    formData.append('inStock', 'true');
    formData.append('categorySlug', 'co-ord-sets'); // Default or could map later
    
    if (images && Array.isArray(images)) {
      images.forEach((imgUrl: string) => {
        formData.append('externalImages', imgUrl);
      });
    }

    const result = await saveMinimalProduct(formData);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save product');
    }

    return NextResponse.json({ success: true, productId: result.productId });
  } catch (error: any) {
    console.error('Extension import error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

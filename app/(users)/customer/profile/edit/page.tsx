import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios from 'axios';
import { API_ENDPOINTS, buildApiUrl } from '../../../../lib/api-config';
import EditProfileClientComponent from './EditProfileClientComponent';
async function getCustomerProfile() {
  try {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('jwtToken');
    const refreshToken = cookieStore.get('refreshToken');
    
    if (!jwtToken) {
      redirect('/customer/login');
    }

    // Build cookie header with both tokens
    const cookieHeader = `jwtToken=${jwtToken.value}${refreshToken ? `; refreshToken=${refreshToken.value}` : ''}`;

    const response = await axios.get(buildApiUrl(API_ENDPOINTS.CUSTOMER_PROFILE), {
      headers: {
        Cookie: cookieHeader
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    redirect('/customer/login');
  }
}

export default async function EditProfilePage() {
  const customerData = await getCustomerProfile();

  return <EditProfileClientComponent initialData={customerData} />;
}

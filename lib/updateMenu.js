import axios from 'axios';
import Cookies from 'js-cookie';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Reusable function for updating a menu item via PUT request
export const updateMenuItemWithAxios = async (id, formData) => {
    const token = Cookies.get('token');
  try {
    const response = await axios.put(
      `${API_BASE_URL}/menu/${id}`,  // Endpoint: e.g., /api/menu/123
      formData,  // Send FormData as the body
      {
        headers: {
          'Content-Type': 'multipart/form-data',  
        'authorization':`Bearer ${token}`
                
        },
      }
    );
    return response.data;  // Returns the API response data
  } catch (error) {
    // Handle error based on response
    if (error.response) {
      // Server responded with a status code (e.g., 400)
      throw new Error(error.response.data.error || 'Failed to update menu item');
    } else if (error.request) {
      // No response from server
      throw new Error('No response from server. Please check your network.');
    } else {
      // Other errors
      throw new Error('An unexpected error occurred.');
    }
  }
};

export const updateMenuImage = async (id, imageFile) => {
    const token = Cookies.get('token');
    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);  // Only append the image
    }
    console.log("Updating image for item:", id, imageFile);
    try {
      const response = await axios.put(`${API_BASE_URL}/menu/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' , 'authorization':`Bearer ${token}`},
      });
      return response.data;
    } catch (error) {
      console.error("Error updating image:", error);
      throw new Error("Error updating image.");
    }
  };
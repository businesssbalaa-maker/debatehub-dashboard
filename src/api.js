import axios from "axios";

// Base URL for the backend API
export const API_BASE_URL = "https://tradingback.online/";
export const API_BASE_URL2 = "https://tradingback.online";
// export const API_BASE_URL = "http://localhost:5004/";
// export const API_BASE_URL2 = "http://localhost:5004";

export const registerUser = async (userData) => { 
    const res = await axios.post(`${API_BASE_URL}api/users/register`, userData);
    return res;
};

export const addWithdrawAmountMenually  = async (phone, Amount,type) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/users/addWithdrawAmountMenually`, {  phone, Amount,type });
    return res.data;
  } catch (err) {
    console.error("Error fetching team:", err);
    return { success: false, message: err.response.data.message };
  }
};
export const addRechargeApi = async (utr, amount, phone) => {
  return await axios.post(`${API_BASE_URL}QR/api/Admin/recharge`, {
    utr,
    amount,
    phone,
  });
};

export const minusAmountApi = async (amount, phone) => {
  return await axios.post(`${API_BASE_URL}QR/api/Admin/recharge/minus`, {
    amount,
    phone,
  });
};



export const uploadQR = async (formData) => {
   const res = await fetch(`${API_BASE_URL}QR/api/upload`, {
        method: 'POST',
        body: formData,
      });
  return res;
};


export const fetchQRs = async () => {
  const res = await fetch(`${API_BASE_URL}QR/api/qrs`);
  const data = await res.json();
  return data;
};

export const updateQR = async (id, file) => {
  const formData = new FormData();
  formData.append('qr', file);

  const res = await fetch(`${API_BASE_URL}QR/api/qrs/${id}`, {
    method: 'PUT',
    body: formData,
  });
  const data = await res.json();
  return data;
};

export const deleteQR = async (id) => {
  const res = await fetch(`${API_BASE_URL}QR/api/qrs/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  return data;
};





// ✅ Get all links
export const getSocialLinks = async () => {
  const res = await axios.get(`${API_BASE_URL}api/SocialMedia`);
  return res.data.data;
};

// ✅ Create new links
export const createSocialLinks = async (data) => {
  const res = await axios.post(`${API_BASE_URL}api/SocialMedia`, data);
  return res.data;
};

// ✅ Update existing links
export const updateSocialLinks = async (id, data) => {
  const res = await axios.put(`${API_BASE_URL}api/SocialMedia/${id}`, data);
  return res.data;
};

// ✅ Delete links
export const deleteSocialLinks = async (id) => {
  const res = await axios.delete(`${API_BASE_URL}api/SocialMedia/${id}`);
  return res.data;
};

export const deleteUser = async (userId) => {
  try {
    const res = await axios.delete(`${API_BASE_URL}api/users/${userId}`);
    return res.data; // returns { success: true, message, deleted: {...} }
  } catch (err) {
    console.error("Error deleting user:", err);
    throw err;
  }
};
export const searchuser = async (id) => {
    const res = await axios.get(`${API_BASE_URL}api/users/search?query=${id}`);
  return res;
};
export const getCommission = async () => {
  const res = await axios.get(`${API_BASE_URL}api/commission`);
  return res.data;
};

// ✅ Update commission percentages
export const updateCommission = async (data) => {
  const res = await axios.put(`${API_BASE_URL}api/commission/update`, data);
  return res.data;
};



// ✅ Create UPI
export const createUPI = async (formData) => {
  try {
   const {upiId,payeeName}= formData;
    const res = await fetch(`${API_BASE_URL}api/upi/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upiId, payeeName })
    });
    return await res.json();
  } catch (err) {
    console.error("Error creating UPI", err);
    return { success: false, message: "Network error" };
  }
};

// ✅ Get All UPIs
export const getUPIs = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}api/upi/list`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching UPI list", err);
    return { success: false, message: "Network error" };
  }
};

// ✅ Get One UPI by ID
export const getUPIById = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}api/upi/get/${id}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching UPI details", err);
    return { success: false, message: "Network error" };
  }
};

// ✅ Update UPI
export const updateUPI = async (id, data) => {
  try {
    const res = await fetch(`${API_BASE_URL}api/upi/edit/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        upiId: data.upiId,        // ✅ only string
        payeeName: data.payeeName // ✅ only string
      }),
    });

    return await res.json();
  } catch (err) {
    console.error("Error updating UPI", err);
    return { success: false, message: "Network error" };
  }
};


// ✅ Delete UPI
export const deleteUPI = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}api/upi/delete/${id}`, {
      method: "DELETE"
    });
    return await res.json();
  } catch (err) {
    console.error("Error deleting UPI", err);
    return { success: false, message: "Network error" };
  }
};



export const sendOtp=async(phone)=>{ const res = await fetch(`${API_BASE_URL}api/users/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      return res;
    }


// 1️⃣ Check if admin can register
export const checkAdminExist = async (phone) => {
  const res = await fetch(`${API_BASE_URL}api/users/check-admin-exist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  console.log(res)
  return await res.json(); // returns { success, exists, message }
};

export const registerAdmin = async (phone, password) => {
  const res = await fetch(`${API_BASE_URL}api/users/create-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  return await res.json(); // { success, admin, message }
};

// 5️⃣ Login Admin
export const loginAdmin = async (phone, password) => {
  const res = await fetch(`${API_BASE_URL}api/users/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  
  return await res.json(); // { success, token, message }
};
// api.js

export const createSubordinate = async (adminPhone, adminPassword, phone, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}api/users/create-subordinate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminPhone,
        adminPassword,
        phone,
        password,
      }),
    });

    return await res.json(); // { success, subordinate, message }
  } catch (err) {
    console.error("Create Subordinate Error:", err);
    return { success: false, message: "Server error" };
  }
};

// 6️⃣ Login Subordinate
export const loginSubordinate = async (phone, password) => {
  const res = await fetch(`${API_BASE_URL}api/users/subordinate-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  return await res.json(); // { success, token, message }
};

// 7️⃣ Get All Subordinate List (for admin dashboard)
export const getAllSubordinateList = async (adminPhone, adminPassword) => {
  const res = await fetch(`${API_BASE_URL}api/users/subordinate`, {
    method: "POST", // Ensure method is uppercase POST
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminPhone, adminPassword }) // <-- stringify JSON
  });
  return await res.json(); // { success, subordinates: [...] }
};


// 8️⃣ Update Subordinate by ID
export const updateSubordinate = async (subId, adminPassword,adminPhone, editPhone,editPassword) => {
  const res = await fetch(`${API_BASE_URL}api/users/subordinate/${subId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json",  },
    body: JSON.stringify({editPhone,editPassword,adminPassword,adminPhone}), // { phone?, password? }
  });
  return await res.json();
};

// 9️⃣ Delete Subordinate by ID
export const deleteSubordinate = async (subId) => {
  const res = await fetch(`${API_BASE_URL}api/users/subordinate/${subId}`, {
    method: "DELETE",
        
    headers: { "Content-Type": "application/json", },
  });
  return await res.json();
};

export const forgetAdminPassword = async (phone, newPassword) => {
  const res = await fetch(`${API_BASE_URL}api/users/forget-admin-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, newPassword }),
  });
  return await res.json(); // { success, message, token }
};

// Add these to your existing src/api.js file
export const getAllProductsAPI = async () => {
  const response = await fetch(`${API_BASE_URL}api/products/`);
  return response.json();
};

export const createProductAPI = async (productData) => {
  const response = await fetch(`${API_BASE_URL}api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  return response.json();
};

export const updateProductAPI = async (id, updatedData) => {
  const response = await fetch(`${`${API_BASE_URL}api/products`}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });
  return response.json();
};
export const deleteProductAPI = async (id) => {
  const response = await fetch(`${`${API_BASE_URL}api/products`}/${id}`, {
    method: "DELETE",
  });

  return response.json();
};

// ==========================================================================
// 1. GET ALL USERS WITH PAGINATION (GET /api/users/all?page=:page&limit=:limit)
// ==========================================================================
export const getAllUsersAPI = async (page = 1, limit = 10) => {
  const response = await fetch(
    `${API_BASE_URL}api/users/all?page=${page}&limit=${limit}`
  );
  return response.json();
};

// ==========================================================================
// 2. GET SINGLE USER DETAILS BY ID (GET /api/users/details/:id)
// ==========================================================================
export const getSingleUserDetailAPI = async (id) => {
  const response = await fetch(`${API_BASE_URL}api/users/details/${id}`);
  return response.json();
};
// A1 & A5: Fetch all structured category areas matrices
export const getAllAreasAPI = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}api/products/areasdata`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

// A1: Create a completely new Category root entity container block
export const createCategoryAreaAPI = async (Category, SubCategoryName) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/products/areas`, { Category, SubCategoryName });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

// A2: Append an isolated separate Sub-Category inside an existing Category
export const appendSubCategoryAPI = async (Category, SubCategoryName) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/products/areas/sub-category`, { Category, SubCategoryName });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

// A3: Wipe clean an entire Category (With Cascade Delete automated on all related questions)
export const purgeCategoryAreaAPI = async (categoryName) => {
  try {
    const res = await axios.delete(`${API_BASE_URL}api/products/areas/${categoryName}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

// A4: Wipe clean a distinct Sub-Category layout node (With Cascade Delete on targeted items)
export const purgeSubCategoryAPI = async (categoryName, subCategoryName) => {
  try {
    const res = await axios.delete(`${API_BASE_URL}api/products/areas/${categoryName}/sub-category/${subCategoryName}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getcatgory= async()=>{
  try {
    const res =await axios.get(`${API_BASE_URL}api/products/areas/all`); 
    return res.data;
  }
    catch (error) { 
      console.log(error)
    } 
}
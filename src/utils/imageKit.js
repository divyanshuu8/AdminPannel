// ImageKit Configuration
// NOTE: We are using the Private Key specifically because the user provided it for this client-side implementation.
// In a production environment with strict security, the private key should reside on a backend server 
// that generates a signature for the client.

const urlEndpoint = "https://ik.imagekit.io/q6yp3qggp";
const publicKey = "public_vOM15jA6KQo+SAcvScXDuZ5mqik=";
const privateKey = "private_uwdzeLbSO1f+qoYoxGQk11QfEqU=";

export const uploadImage = async (file, fileName) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName || file.name);
    formData.append("useUniqueFileName", "true");
    formData.append("tags", "blog-image");
    
    // We can add folder path if needed
    // formData.append("folder", "/blogs");

    // Authentication: Basic Auth with Private Key
    // Authorization: Basic base64(privateKey:)
    const authHeader = "Basic " + btoa(privateKey + ":");

    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("ImageKit API Error:", data);
      throw new Error(data.message || "Upload failed");
    }

    return data;
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw error;
  }
};


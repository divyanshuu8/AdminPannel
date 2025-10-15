// netlify/functions/deleteImg.js
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  const { deleteUrl } = JSON.parse(event.body);

  if (!deleteUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing deleteUrl" }),
    };
  }

  try {
    // ImgBB delete URL uses GET and returns HTML
    const response = await fetch(deleteUrl, { method: "GET" });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: "Failed to delete image" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Image deleted" }),
    };
  } catch (err) {
    console.error("Delete function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}

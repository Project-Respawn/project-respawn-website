export default async function handler(res: any) {
  const PRINTFUL_API_KEY = "Az8fvQvo9NI8058Kawm8EglX8qdRbn2JeXkXdj2f"

  const response = await fetch("https://api.printful.com/store/products", {
    headers: {
      Authorization: `Bearer ${PRINTFUL_API_KEY}`
    }
  });

  const data = await response.json();

  console.log("PRINTFUL RESPONSE:", data);

  res.status(200).json(data);
}


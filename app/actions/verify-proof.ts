"use server";
export const verifyProof = async (proof) => {
  console.log('proof', proof);

  const response = await fetch(
    'https://developer.worldcoin.org/api/v2/verify/app_staging_7c78da1425e707d4e9c34e6959379d58',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...proof, action: "test" }),
    }
  );

  if (response.ok) {
    const { verified } = await response.json();
    return verified;
  }

  const { code, detail } = await response.json();
  throw new Error(`Error Code ${code}: ${detail}`);
};

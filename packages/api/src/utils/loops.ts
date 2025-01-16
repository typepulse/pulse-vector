type UpdateContactParams = {
  email: string;
  isFileUploaded: boolean;
};

export async function updateLoopsContact(params: UpdateContactParams) {
  const { email, isFileUploaded } = params;

  try {
    const response = await fetch(
      "https://app.loops.so/api/v1/contacts/update",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          isFileUploaded,
        }),
      },
    );

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error updating Loops contact:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

async function test() {
  try {
    const payload = {
      title: "Test Job dari AI",
      description: "Ini adalah job test untuk verifikasi schema baru.",
      budget: 75000,
      category: "Tugas",
      keywords: "Test, AI, Backend",
      isAnonymous: false,
      isFixedPrice: true,
      clientId: "test-user-123",
      clientName: "AI Tester",
      clientPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=AI"
    };

    console.log("Sending POST to /jobs...");
    const response = await fetch('http://localhost:3000/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json() as any;
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (response.status !== 201) return;

    const jobId = data.data.id;
    console.log("\nSearching for 'Backend' in /jobs...");
    const searchRes = await fetch(`http://localhost:3000/jobs?q=Backend`);
    const searchData = await searchRes.json() as any;
    console.log("Search results count:", searchData.data.length);
    
    const found = searchData.data.find((j: any) => j.id === jobId);
    if (found) {
      console.log("✅ Success! Job found via keyword search.");
      console.log("Keywords in DB:", found.keywords);
    } else {
      console.log("❌ Failed! Job not found via keyword search.");
    }

  } catch (error: any) {
    console.error("Test failed:", error.message);
  }
}

test();

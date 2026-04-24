async function test() {
  const workerId = "test-worker-456";
  const clientId = "test-client-789";

  try {
    // 1. Create a Job
    console.log("1. Creating Job...");
    const jobPayload = {
      title: "Bantu Koding UI",
      description: "Butuh bantuan koding UI nih.",
      budget: 100000,
      clientId: clientId,
      clientName: "Boss Rafi"
    };
    const jobRes = await fetch('http://localhost:3000/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobPayload)
    });
    const jobData = await jobRes.json() as any;
    const jobId = jobData.data.id;
    console.log("Job Created:", jobId);

    // 2. Place a Bid
    console.log("\n2. Placing Bid...");
    const bidPayload = {
      workerId: workerId,
      workerName: "Rafi Worker",
      price: 90000,
      pitch: "Saya jago koding UI bro!"
    };
    const bidRes = await fetch(`http://localhost:3000/jobs/${jobId}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bidPayload)
    });
    console.log("Bid Status:", bidRes.status);

    // 3. Fetch My Bids
    console.log("\n3. Fetching Worker's Bids...");
    const myBidsRes = await fetch(`http://localhost:3000/bids?workerId=${workerId}`);
    const myBidsData = await myBidsRes.json() as any;
    console.log("Found Bids:", myBidsData.data.length);
    
    if (myBidsData.data.length > 0) {
      const bid = myBidsData.data[0];
      console.log("✅ Success! Bid found with denormalized data:");
      console.log("- Job Title:", bid.jobTitle);
      console.log("- Client Name:", bid.clientName);
      console.log("- Status:", bid.status);
    }

    // 4. Accept Bid (Assign Worker)
    console.log("\n4. Accepting Bid (Assigning Worker)...");
    const assignRes = await fetch(`http://localhost:3000/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: clientId,
        status: 'assigned',
        workerId: workerId
      })
    });
    console.log("Assign Status:", assignRes.status);

    // 5. Verify Bid Status
    console.log("\n5. Verifying Bid Status after Assignment...");
    const verifyRes = await fetch(`http://localhost:3000/bids?workerId=${workerId}`);
    const verifyData = await verifyRes.json() as any;
    const updatedBid = verifyData.data.find((b: any) => b.jobId === jobId);
    console.log("- New Status:", updatedBid.status);
    if (updatedBid.status === 'accepted') {
      console.log("✅ Success! Bid status sync works.");
    }

  } catch (error: any) {
    console.error("Test failed:", error.message);
  }
}

test();

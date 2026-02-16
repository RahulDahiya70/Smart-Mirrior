const video = document.getElementById("video");

// Load face-api models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://justadudewhohacks.github.io/face-api.js/models"
  ),
  faceapi.nets.faceLandmark68Net.loadFromUri(
    "https://justadudewhohacks.github.io/face-api.js/models"
  ),
  faceapi.nets.faceExpressionNet.loadFromUri(
    "https://justadudewhohacks.github.io/face-api.js/models"
  ),
  faceapi.nets.ageGenderNet.loadFromUri(
    "https://justadudewhohacks.github.io/face-api.js/models"
  ),
]).then(startVideo);

// Start camera
function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      console.log("Camera started");
      video.srcObject = stream;
    })
    .catch((err) => {
      console.error("Camera error:", err);
      alert("Please allow camera access");
    });
}

// Detect faces
video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.querySelector(".container").append(canvas);

  const displaySize = {
    width: video.videoWidth,
    height: video.videoHeight,
  };

  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resized = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceLandmarks(canvas, resized);
    faceapi.draw.drawFaceExpressions(canvas, resized);

    resized.forEach((result) => {
      const { age, gender } = result;
      const box = result.detection.box;
      const label = `${Math.round(age)} yrs | ${gender}`;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: label,
      });
      drawBox.draw(canvas);
    });
  }, 200);
});


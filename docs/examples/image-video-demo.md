# Image & Video Demos

This page shows how to include an external image link and a YouTube video inside MkDocs.

## Image Link Example

You can link an image from a public URL, or place your image inside `docs/assets/images/`.

[![Example nonlinear surface](https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop)](https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop)

!!! tip
    For production, it is better to store important images in your repository under `docs/assets/images/` so the website does not depend on external image availability.

## YouTube Video Example

<div class="video-frame">
  <iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/HotWbPHfODU?si=QsyMXN50MCjYegb9"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen>
  </iframe>
</div>

You can replace the video ID with your real PySNE tutorial or research presentation video.

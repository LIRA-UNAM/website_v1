---
title: Projects
nav:
  order: 2
  tooltip: Humanoids, drones, and more
---

# {% include icon.html icon="fa-solid fa-wrench" %}Projects

From humanoids to autonomous drones, these are some of the projects where we bring robotics and innovation to life.

{% include tags.html tags="autonomous, humanoid, computer vision" %}

{% include search-info.html %}

{% include section.html %}

## Featured

{% include list.html component="card" data="projects" filter="group == 'featured'" %}

{% include section.html %}

## More

{% include list.html component="card" data="projects" filter="!group" style="small" %}

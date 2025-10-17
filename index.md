---
---
# **Who are we?**
{:.left}
---

LIRA is a research laboratory founded within the School of Engineering at the National Autonomous University of Mexico. We develop cutting-edge robotics, computer vision, locomotion, reinforcement learning, and humanoid robot interaction (HRI), with emphasis on humanoid robotics, UAVs, and related areas.
<br>
<br>
{%
  include button.html
  type="youtube"
  text="LIRA Youtube"
  link="@LIRA-UNAM"
%}
{%
  include button.html
  type="github"
  text="Follow us on Github"
  link="LIRA-UNAM"
%}

{% include section.html %}

## Highlights

{% capture text %}

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

{%
  include button.html
  link="publications"
  text="See our publications"
  icon="fa-solid fa-arrow-right"
  flip=true
  style="bare"
%}

{% endcapture %}

{%
  include feature.html
  image="images/photo.jpg"
  link="research"
  title="Our Research"
  text=text
%}

{% capture text %}

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

{%
  include button.html
  link="projects"
  text="Browse our projects"
  icon="fa-solid fa-arrow-right"
  flip=true
  style="bare"
%}

{% endcapture %}

{%
  include feature.html
  image="images/photo.jpg"
  link="projects"
  title="Our Projects"
  flip=true
  style="bare"
  text=text
%}

{% capture text %}

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

{%
  include button.html
  link="people"
  text="Meet our team"
  icon="fa-solid fa-arrow-right"
  flip=true
  style="bare"
%}

{% endcapture %}

{%
  include feature.html
  image="images/photo.jpg"
  link="people"
  title="Our Team"
  text=text
%}

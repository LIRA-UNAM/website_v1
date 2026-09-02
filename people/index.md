---
title: People
nav:
  order: 4
  tooltip: About us
---

# {% include icon.html icon="fa-solid fa-microscope" %}Professors

{% include list.html data="members" component="portrait" filter="role == 'professor'" %}

{% include people-tabs.html data="members" component="portrait" tabs="people_tabs" %}

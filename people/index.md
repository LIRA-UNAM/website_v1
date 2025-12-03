---
title: People
nav:
  order: 4
  tooltip: About us
---

# {% include icon.html icon="fa-solid fa-users" %}Professors

{% include list.html data="members" component="portrait" filter="role == 'professor'" %}

# {% include icon.html icon="fa-solid fa-user-graduate" %}Masters Students
{% include list.html data="members" component="portrait" filter="role == 'graduate'" %}

# {% include icon.html icon="fa-solid fa-graduation-cap" %}Undergraduate Students
{% include list.html data="members" component="portrait" filter="role == 'undergrad'" %}

# Outside Collaborators
{% include list.html data="members" component="portrait" filter="role == 'external'" %}

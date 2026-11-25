---
title: Contact
nav:
  order: 6
  tooltip: Email, address, and location
---

# {% include icon.html icon="fa-regular fa-envelope" %}Contact

You can contact us by email or phone, or visit us on the ground floor of Building U – Classrooms for Graduate Studies and Advising, at the Graduate Program in Engineering, UNAM.

{% capture email_note %}
**Students:** when you write to us, please send your email to **both** addresses below (marco.negrete@ingenieria.unam.edu and lira@ingenieria.unam.edu) in the same message. That way, whoever is available can reply and we can respond to you faster. Briefly tell us who you are, your program or university, and what you are interested in (social service, research stay, thesis, etc.).
{% endcapture %}
{% include alert.html type="info" content=email_note %}

<div class="contact-emails">

{%
  include button-copy.html
  type="email"
  text="marco.negrete@ingenieria.unam.edu"
  link="marco.negrete@ingenieria.unam.edu"
%}

{%
  include button-copy.html
  type="email"
  text="lira@ingenieria.unam.edu"
  link="lira@ingenieria.unam.edu"
%}
</div>

{%
  include button.html
  type="phone"
  text="55-5622-3899 Ext 86247"
  link="+52-55-5622-3899"
%}
{%
  include button.html
  type="address"
  tooltip="Our location on Google Maps for easy navigation"
  link="https://www.google.com/maps/place/19%C2%B019'42.5%22N+99%C2%B010'53.4%22W/@19.3284733,-99.1821401,19z/data=!3m1!4b1!4m4!3m3!8m2!3d19.328472!4d-99.181495?entry=ttu&g_ep=EgoyMDI1MTAwNi4wIKXMDSoASAFQAw%3D%3D"
%}

{% include section.html %}

## Work with us

{%
  include card.html
  image="images/unam.png"
  title="Social Service"
  description="We offer social service positions for UNAM students interested in robotics, computer vision, and artificial intelligence. Email us to learn about the available projects and the enrollment requirements."
  style="medium"
%}
{%
  include card.html
  image="images/team.jpg"
  title="Research Stays"
  description="We welcome students from other universities, both national and international, who are interested in a research stay at the lab. Tell us about your academic background and your area of interest."
  style="medium"
%}
{%
  include card.html
  image="images/icon.png"
  title="Sponsors"
  description="We are looking for companies and institutions interested in sponsoring our robotics projects and our participation in international competitions such as RoboCup. Contact us to learn about the collaboration options."
  style="medium"
%}

{% include section.html %}

## Location

Find us on the map, or follow the short walkthrough showing the route to the lab, on the ground floor of Building U at the Graduate Program in Engineering.

<div class="cols contact-location" style="--cols: 2">
  <div>
    <iframe src="https://www.google.com/maps?q=19.328473,-99.182140&z=17&output=embed" title="LIRA lab location on Google Maps" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
  </div>
  <div>
    <img src="{{ '/images/lab_location.webp' | relative_url }}" alt="Walking route to the LIRA lab in Building U, Graduate Program in Engineering, UNAM" width="960" height="540" loading="lazy" decoding="async">
  </div>
</div>

{% include section.html dark=true %}


{% capture col1 %}
<div style="font-size: 0.9em;">
<a href="https://www.unam.mx/">Universidad Nacional Autónoma de México<br></a>
Av. Universidad 3000, Ciudad Universitaria, Coyoacán, Cd. Mx., CP 04510
</div>
{% endcapture %}
 

{% capture col2 %}
<div style="font-size: 0.9em;"> 
<a href="https://www.ingenieria.unam.mx/">Facultad de Ingeniería </a><br>
Av. Universidad 3000, Ciudad Universitaria, Coyoacán, Cd. Mx., CP 04510  <br>
email: fainge@unam.mx
</div>
{% endcapture %}

{% capture col3 %}
<div style="font-size: 0.9em;">
<a href="http://posgrado.electrica.unam.mx/">Posgrado de Ingeniería Eléctrica</a><br>
Edificio S – “Bernardo Quintana Arrioja”, Primer Piso, FI, Cd. Universitaria, Cd. Mx. C.P. 04510.<br>
email: ingenieria.electrica@posgrado.unam.mx
</div>

{% endcapture %}

{% include cols.html col1=col1 col2=col2 col3=col3 %}

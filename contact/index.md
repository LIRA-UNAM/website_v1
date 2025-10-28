---
title: Contact
nav:
  order: 5
  tooltip: Email, address, and location
---

# {% include icon.html icon="fa-regular fa-envelope" %}Contact

You can contact us by email or phone, or visit us on the ground floor of Building U – Classrooms for Graduate Studies and Advising, at the Graduate Program in Engineering, UNAM.
<br>
<br>

{%
  include button.html
  type="email"
  text="lir.pumas@gmail.com"
  link="lir.pumas@gmail.com"
%}
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

{% capture col1 %}



{% endcapture %}

{% capture col2 %}



{% endcapture %}

{% include cols.html col1=col1 col2=col2 %}

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
Edificio S – “Bernardo Quintana Arrioja”, Primer Piso, FI, Cd. Universitaria, Cd. Mx. C.P. 04510.
email: ingenieria.electrica@posgrado.unam.mx
</div>

{% endcapture %}

{% include cols.html col1=col1 col2=col2 col3=col3 %}

---
title: Contact
nav:
  order: 6
  tooltip: Email, address, and location
---

# {% include icon.html icon="fa-regular fa-envelope" %}Contact

You can contact us by email or phone, or visit us on the ground floor of Building U – Classrooms for Graduate Studies and Advising, at the Graduate Program in Engineering, UNAM.
<br>
<br>

{%
  include button-copy.html
  type="email"
  text="lira@ingenieria.unam.edu"
  link="lira@ingenieria.unam.edu"
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

## Colabora con nosotros

{%
  include card.html
  image="images/unam.png"
  title="Servicio Social"
  description="Ofrecemos plazas de servicio social para estudiantes de la UNAM interesados en robótica, visión computacional e inteligencia artificial. Escríbenos para conocer los proyectos disponibles y los requisitos de inscripción."
  style="medium"
%}
{%
  include card.html
  image="images/team.jpg"
  title="Estancias de Investigación"
  description="Recibimos estudiantes de otras universidades, nacionales e internacionales, interesados en realizar una estancia de investigación en el laboratorio. Cuéntanos tu perfil académico y tu área de interés."
  style="medium"
%}
{%
  include card.html
  image="images/icon.png"
  title="Patrocinadores"
  description="Buscamos empresas e instituciones interesadas en patrocinar nuestros proyectos de robótica y nuestra participación en competencias internacionales como la RoboCup. Contáctanos para conocer las opciones de colaboración."
  style="medium"
%}

{% include section.html %}

## Ubicación

<iframe
  src="https://www.google.com/maps?q=19.328473,-99.182140&z=17&output=embed"
  width="100%"
  height="450"
  style="border: 0; border-radius: var(--rounded);"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>

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

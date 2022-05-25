import {
  el,
  mount
} from "redom";
import {
  renderHeaderWithMenu
} from "./header";
import {
  renderPageTitle
} from "./view";
import {
  Loader
} from "@googlemaps/js-api-loader"
import {
  MarkerClusterer
} from "@googlemaps/markerclusterer";


export async function renderCashDispensersInfo() {
  const token = sessionStorage.getItem('token');

  renderHeaderWithMenu();
  document.querySelector('a[href="/cash-machines"]').classList.add('is-active');

  renderPageTitle('body', 'ATMs map');

  const mapContainer = el('.container__map#map');
  mount(document.querySelector('.container'), mapContainer);

  // Get bank locations
  const res = await fetch('http://localhost:5000/banks');
  const data = await res.json();

  const locations = data.payload.map(item => {
    return {
      lat: item.lat,
      lng: item.lon
    }
  });

  // Initializing and adding the Google map
  const loader = new Loader({
    apiKey: "AIzaSyCK11BKBD28fHfL-72EjwlvxduSqFZE4ro",
    version: "weekly",
  });

  loader.load().then(() => {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: locations[20],
      zoom: 11,
    });
    const infoWindow = new google.maps.InfoWindow({
      content: "",
      disableAutoPan: true,
    });

    const labels = "Coin";

    const markers = locations.map((position, i) => {
      const label = '';
      const marker = new google.maps.Marker({
        position,
        label,
      });

      marker.addListener("click", () => {
        infoWindow.setContent(labels);
        infoWindow.open(map, marker);
      });
      return marker;
    });

    new MarkerClusterer({
      markers,
      map
    });
  });
}

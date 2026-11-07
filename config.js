/* Invitación al aniversario de Ají Soltero. Vacíos = pendientes.
   Fotografías locales: cambia src y alt; puedes agregar elementos a las galerías. */
window.INVITATION_CONFIG = {
  restaurantName: 'Ají Soltero', honoree: '',
  eventDate: '23 de diciembre', eventTime: '7:00 p. m.',
  address: 'América Sur 4416', city: '', mapsUrl: 'https://maps.app.goo.gl/FFGoJoN9sKyaPjwx7',
  date: { year: null, month: 12, day: 23, hour: 19, minute: 0, timeZone: '' },
  whatsapp: '', audio: 'assets/audio/musica_aniversario.mp3',
  // Escenas 2.5D: fotografías, perspectiva CSS y desplazamiento natural.
  scenes: { enabled: true, pointer: true },
  photos: {
    tunantada: [
      {src:'assets/photos/tunantada-encuentro.jpeg',width:1164,height:1600,alt:'Jaujina y Chuto en un encuentro de Tunantada, con indumentaria tradicional y máscaras',title:'El encuentro · Tunantada',window:'dance-encuentro'},
      {src:'assets/photos/tunantada-pareja.jpeg',width:1245,height:1600,alt:'Pareja de Tunantada con sombreros, máscaras y trajes bordados de colores',title:'Color y tradición · Tunantada',window:'dance-pareja'}
    ],
    salon: {src:'assets/photos/salon.webp',width:967,height:1361,alt:'Mesa larga en un jardín con flores naturales, copas y luces cálidas'},
    hero: {src:'assets/photos/flores.webp',width:1279,height:1455,alt:'Arreglo de flores blancas y follaje sobre una mesa decorada'},
    bartender: {src:'assets/photos/bartender.webp',width:574,height:541,alt:'Bartender de la fotografía proporcionada, con camisa blanca y corbatín negro'},
    food: [
      {src:'assets/photos/asado.webp',width:1279,height:1350,alt:'Asado de res servido con salsa',title:'Asado de res'},
      {src:'assets/photos/bocaditos.webp',width:1010,height:1600,alt:'Bocaditos dispuestos en una estación de catering',title:'Variedad de bocaditos'},
      {src:'assets/photos/mesa.webp',width:1014,height:1600,alt:'Presentación de bocaditos sobre una mesa',title:'Para compartir'},
      {src:'assets/photos/canapes.webp',width:964,height:1600,alt:'Pequeños bocados presentados para una celebración',title:'Pequeños detalles'}
    ],
    drinks: [
      {src:'assets/photos/cocteles.webp',width:1131,height:1265,alt:'Variedad de cócteles en copas con frutas y flores',title:'Un brindis lleno de color'},
      {src:'assets/photos/preparacion.webp',width:462,height:632,alt:'Preparación de una bebida en copa',title:'El arte de preparar'},
      {src:'assets/photos/brindis.webp',width:521,height:491,alt:'Detalle de cócteles con hielo y frutas en la barra',title:'Detalles en cada copa'}
    ],
    decor: [
      {src:'assets/photos/flores.webp',width:1279,height:1455,alt:'Flores blancas y follaje natural',title:'Flores y naturaleza'},
      {src:'assets/photos/globos.webp',width:1004,height:1600,alt:'Decoración de globos verdes, marfil y dorados',title:'Olivo, marfil y dorado'}
    ]
  }
};

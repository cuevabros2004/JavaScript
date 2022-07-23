let montoProducto;
let montoTotalCarrito = 0;


//Clase Producto que almacenará los productos/servicios disponibles
class Producto{
    constructor(codigo, nombreProducto, precioPorPersona, imagen){
        this.codigo = codigo;
        this.nombreProducto = nombreProducto; 
        this.precioPorPersona = parseFloat(precioPorPersona);
        this.imagen = imagen;
    }

        //Calculo el total según la cantidad de personas ingresada
        calcularPrecioTotal(cantPersonas){
            return  this.precioPorPersona *  cantPersonas;
        }
}

//Clase Carrito que almacenará los productos/servicios seleccionados por la persona
class Carrito{
    constructor(codigo, nombreProducto, cantidadPersonas, precioProducto, imagen){
        this.codigo = codigo;
        this.nombreProducto = nombreProducto;
        this.cantidadPersonas = cantidadPersonas;
        this.precioProducto = precioProducto;
        this.imagen = imagen;
    }
}

//Inicializo arrays
const productos=[];
const productosCarrito=[];

cargarProductosJSON = () => {
    //inserto valores en array de productos a partir del archivo de JASON (productos.json)
    fetch('json/productos.json')
    
    .then( (resp) => resp.json())
    .then( (data) => {

    data.forEach(({codigo, nombreProducto,  precioPorPersona, imagen})  => {
        productos.push(new Producto(codigo, nombreProducto, precioPorPersona, imagen));
    })

    let productosJSON = JSON.stringify(productos);
    localStorage.setItem('productos', productosJSON);
    mostrarProductosDisponibles();
    })
}
 
//función que permite eliminar el producto del carrito
function eliminarProductoSeleccionado(codigo){

    for (let i=0;i<productosCarrito.length;i++){
        if( productosCarrito[i].codigo == codigo) {
           
            productosCarrito.splice(i, 1); 
            mostrarProductosSeleccionados(productosCarrito);          
            let carritoJSON = JSON.stringify(productosCarrito);
            localStorage.setItem('carrito', carritoJSON);
        } 
   } 

}

//función que permite visualizar los productos del carrito
function mostrarProductosDisponibles(){
    const contenedorServicios = document.getElementById("contenedorProductos");

    contenedorServicios.innerHTML = "";

    //Concateno cód. producto con nombre de producto para mostrar
    for (const producto of productos){
        const divServicios = document.createElement("div");
        divServicios.classList.add("articulos");

       divServicios.innerHTML= `
         <h3 class="titulosCards">${producto.nombreProducto}</h3>
         <img src="${producto.imagen}" alt="${producto.nombreProducto}">
         <h4 class="Precio"> PRECIO POR PERSONA:  $ ${producto.precioPorPersona} </h4>
       `;    
       const botonCarrito = document.createElement("button");
       botonCarrito.classList.add("botonesAgregar");
       botonCarrito.innerHTML = "AGREGAR AL CARRITO"
     
       botonCarrito.addEventListener("click", () => {        
        agregarProductoAlCarrito(producto);
       })
       
       contenedorServicios.appendChild(divServicios);
       divServicios.appendChild(botonCarrito);
             
    }
    
}

//función que agrega los productos seleccionados al carrito
function agregarProductoAlCarrito(producto){  

    let cantPersonas = document.getElementById("cantidadPersonas").value;  

    //llamo función que valida datos (si fue ingresada la cantidad de personas y si el producto seleccionado no se encuentra ya en el carrito)
    //si la validación es correcta llama función agregarProducto la cual agrega el producto en array del carrito de compras y en el localStorage
    const validacion = validarDatos(producto);
    validacion == 0 ? agregarProducto(producto):mostrarAlerta(validacion);

    function agregarProducto(producto){
        // ingreso en el array y objeto Carrito el producto seleccionado
        productosCarrito.push(new Carrito(producto.codigo, producto.nombreProducto, cantPersonas, producto.calcularPrecioTotal(cantPersonas), producto.imagen));
            
        let carritoJSON = JSON.stringify(productosCarrito);
        localStorage.setItem('carrito', carritoJSON);
        localStorage.setItem('cantidadPersonas', cantPersonas)
    
        mostrarMensaje("El producto: " + producto.nombreProducto + " fue agregado al carrito con éxito", 0, 0);
    
        mostrarProductosSeleccionados(Carrito);         
    }

}



//función que muestra los productos seleccionados
function mostrarProductosSeleccionados(producto){

    let listaProductos = document.getElementById("carrito");
    listaProductos = document.getElementById("carrito");
    let totales = document.getElementById("totales");

    listaProductos.innerHTML = ""

    //Calculo el monto total del carrito
    const montoTotalCarrito = productosCarrito.reduce((acumulador, productosCarrito) => acumulador + productosCarrito.precioProducto, 0)
    
    totales.innerText = "TOTAL CARRITO: " + " $ ".padStart(95, '.') + String(montoTotalCarrito);

     productosCarrito.forEach(({codigo, nombreProducto,  precioProducto, imagen}) =>{
        let contenedor = document.createElement("li"); 
        contenedor.innerHTML = ""
       // contenedor.innerHTML =  nombreProducto + " $ ".padStart(80, ".") +  String(precioProducto) +  "\n";
        
        contenedor.innerHTML= `
        <h3 class="titulosCards">${nombreProducto}</h3>
        <img class= "imagenCarrito" src="${imagen}" alt="${nombreProducto}" width=150px alignitem="center">
        <h4 class="Precio"> PRECIO PRODUCTO:  $ ${precioProducto} </h4>
      `;  

       // document.body.appendChild(contenedor);
        listaProductos.append(contenedor);
        
        const botonQuitarCarrito = document.createElement("button");
        botonQuitarCarrito.innerHTML = "QUITAR DEL CARRITO"
        contenedor.append(botonQuitarCarrito);
        botonQuitarCarrito.classList.add("botonesQuitar");
        
        botonQuitarCarrito.addEventListener("click", () => {
         eliminarProductoSeleccionado(codigo);
        }     )
              
    } 
  
     )
    } 
//prepara el Div donde se mostrarán los productos del carrito
function dibujarDivCarrito(){
    let carrito = document.getElementById("encabezadoCarrito");
    let totales = document.getElementById("totales");    
    let contenedorProductos = document.getElementById("contenedorProductos"); 
    
 
    let titulo = document.createElement("h3");

    titulo.innerText = "CARRITO DE COMPRAS"
    totales.innerText = "TOTAL CARRITO: $ 0.00"

    carrito.append(titulo);
    
    document.getElementById("encabezadoCarrito").className = "carrito";
    document.getElementById("totales").className = "totales";
}

//función que trae los productos y cantidad de personas seleccionadas 
//del Storage
function traerProductosLocalStorage(){
    let itemsFromStorage = localStorage.getItem('carrito');
    let cajaTextoCantPersonas = document.getElementById("cantidadPersonas");
    cajaTextoCantPersonas.value = localStorage.getItem('cantidadPersonas');

    let items = JSON.parse( itemsFromStorage );
    
    if (itemsFromStorage){
        items.forEach(items => {
           productosCarrito.push(items);
         })
    }
}

//función que muestra mensaje
function mostrarMensaje(mensaje, posX, posY){
    Toastify({
        text: mensaje,
        className: "info",
        offset: {
            x: posX, 
            y: posY 
          },
        style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();
}

//función que muestra alerta
function mostrarAlerta(alerta){
    swal({
        title: "Carrito de Compras",
        text: alerta,
        icon: "warning",
      });
}

function validarDatos(producto){
    let cantPersonas = document.getElementById("cantidadPersonas").value; 
    let encontrado = 0;
    let validar = "";
    

    for (let i=0;i<productosCarrito.length;i++){
        if( productosCarrito[i].codigo == producto.codigo) {            
           encontrado = 1;
        } 
 
   } 

   if (encontrado==1){     
         return "El producto: " + producto.nombreProducto + " ya se encuentra agregado al carrito";
    }
    else
        if (cantPersonas==0 || isNaN(cantPersonas)){
            return "Debe ingresar la cantidad de personas";
        }
        else     
            return 0;
    
    



}

//Cargo y muestro productos disponibles que se encuentran en archivo JSON (productos.json)
cargarProductosJSON();

//llamo función que prepara el div donde se van a mostrar los productos del carrito
dibujarDivCarrito();

//llama función que trae los datos (Productos y Cant. de personas ingresada) del Storage
traerProductosLocalStorage();
mostrarProductosSeleccionados();



 






 
    
 
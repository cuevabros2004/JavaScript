let montoProducto;
let montoTotalCarrito = 0;

const criteriosPreciosMinimos = [];
const criteriosPreciosMaximos = [];

criteriosPreciosMinimos[0] = "0";
criteriosPreciosMinimos[1] = "300";
criteriosPreciosMinimos[2] = "500";
criteriosPreciosMinimos[3] = "0";

criteriosPreciosMaximos[0] = "300";
criteriosPreciosMaximos[1] = "500";
criteriosPreciosMaximos[2] = "99999999999999999";
criteriosPreciosMaximos[3] = "99999999999999999";


let list = ['Precio Menor a $ 300', 'Precio entre $ 300 y $ 500', 'Precio Mayor a $ 500', 'Todos los Productos'];

let f = new Date();
let fecha = f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear();


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

//Clase ComprasRealizadas que almacenará los productos/servicios comprados
class ComprasRealizadas{
    constructor(codigo, nombreProducto, cantidadPersonas, precioProducto, imagen, fechaCompra){
        this.codigo = codigo;
        this.nombreProducto = nombreProducto;
        this.cantidadPersonas = cantidadPersonas;
        this.precioProducto = precioProducto;
        this.imagen = imagen;
        this.fechaCompra = fechaCompra;
    }
}

//Inicializo arrays
const productos=[];
const productosCarrito=[];
const productosComprasRealizadas=[];

cargarProductosJSON = () => {
    //inserto valores en array de pr oductos a partir del archivo de JASON (productos.json)
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
    productosFiltrados = productos.filter(el => (el.precioPorPersona>=0));

    for (let i=0;i<criteriosPreciosMinimos.length;i++){
         
         let opt = 'chk' + i
        
         let optSel = document.getElementById(opt)

        if (optSel.checked){
           productosFiltrados = productos.filter(el => el.precioPorPersona>criteriosPreciosMinimos[i] && el.precioPorPersona<criteriosPreciosMaximos[i]);
           localStorage.setItem('optSelect', opt)
        }
         
    }
    
    const contenedorServicios = document.getElementById("contenedorProductos");

    contenedorServicios.innerHTML = "";

    //Concateno cód. producto con nombre de producto para mostrar
    for (const producto of productosFiltrados){
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
    
    if (productosFiltrados.length==0){

        const mensajeServiciosNoEncontrados = document.createElement("p");

        contenedorServicios.appendChild(mensajeServiciosNoEncontrados);

        mensajeServiciosNoEncontrados.classList.add("MensajeFiltroSinResultado")

        mensajeServiciosNoEncontrados.innerHTML = "NO EXISTEN PRODUCTOS PARA EL FILTRO SELECCIONADO"
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



    //función que muestra los productos seleccionados
function mostrarComprasRealizadas(){
        let listaProductosCompra = document.getElementById("comprasRealizadas");
        let totalesCompra = document.getElementById("totalesComprasRealizadas");
        let tituloCompra = document.getElementById("encabezadoComprasRealizadas");
        
        let titulo = document.createElement("h3");
        tituloCompra.append(titulo)

        listaProductosCompra.innerHTML = ""
    
            //Calculo el monto total 7del carrito
            const montoTotalCarritoCompra = productosComprasRealizadas.reduce((acumulador, productosCarrito) => acumulador + productosCarrito.precioProducto, 0)
                
            productosComprasRealizadas.forEach(({codigo, nombreProducto, cantidadPersonas, precioProducto, imagen, fechaCompra}) =>{
                let contenedor = document.createElement("li"); 
                contenedor.innerHTML = ""
            // contenedor.innerHTML =  nombreProducto + " $ ".padStart(80, ".") +  String(precioProducto) +  "\n";
                
                contenedor.innerHTML= `
                <h3 class="titulosCards">${fechaCompra}</h3>
                <h4 class="Precio"> PRODUCTO: ${nombreProducto} </h4>
                <h4 class="Precio"> PRECIO:  $ ${precioProducto} </h4>
            `;  

            totalesCompra.innerHTML = "TOTAL COMPRAS: $" + montoTotalCarritoCompra
            totalesCompra.classList.add("totalesComprasRealizadas");
            listaProductosCompra.append(contenedor);
                    
            } 

            )
    } 


    function confirmarCompra(){
 
        let listaProductosCompra = document.getElementById("comprasRealizadas");
        let totalesCompra = document.getElementById("totalesComprasRealizadas");
        let tituloCompra = document.getElementById("encabezadoComprasRealizadas");
        
        let titulo = document.createElement("h3");
        tituloCompra.append(titulo)

        listaProductosCompra.innerHTML = ""

        //Paso productos del carrito al array de objetos ComprasRealizadas
        productosCarrito.forEach(({codigo, nombreProducto, cantidadPersonas, precioProducto, imagen}) =>{

            productosComprasRealizadas.push(new ComprasRealizadas(codigo, nombreProducto, cantidadPersonas, precioProducto, imagen, fecha));       
             
        }       
         )

         let comprasRealizadasJSON = JSON.stringify(productosComprasRealizadas);
         localStorage.setItem('productosCompras', comprasRealizadasJSON);
         mostrarProductosDisponibles();


        //Calculo el monto total 7del carrito
        const montoTotalCarritoCompra = productosComprasRealizadas.reduce((acumulador, productosCarrito) => acumulador + productosCarrito.precioProducto, 0)
    
        productosComprasRealizadas.forEach(({codigo, nombreProducto, cantidadPersonas, precioProducto, imagen, fechaCompra}) =>{

            let contenedor = document.createElement("li"); 
            contenedor.innerHTML = ""
           // contenedor.innerHTML =  nombreProducto + " $ ".padStart(80, ".") +  String(precioProducto) +  "\n";
            
            contenedor.innerHTML= `
            <h3 class="titulosCards">${fechaCompra}</h3>
            <h4 class="Precio"> PRODUCTO:  $ ${nombreProducto} </h4>
            <h4 class="Precio"> PRECIO:  $ ${precioProducto} </h4>
          `;  
    
           totalesCompra.innerHTML = "TOTAL COMPRAS: $" + montoTotalCarritoCompra
           totalesCompra.classList.add("totales");
           listaProductosCompra.append(contenedor);
                 
        } 
      
         )


         borrarLocalStorageCarrito();
         productosCarrito.splice(0, productosCarrito.length)
         
         mostrarProductosSeleccionados();
        } 

//prepara el Div donde se mostrarán los productos del carrito
function dibujarDivCarrito(){
    let carrito = document.getElementById("encabezadoCarrito");
    let totales = document.getElementById("totales");    
    let contenedorProductos = document.getElementById("contenedorProductos"); 
    let carritoCompras = document.getElementById("carritoCompras");
 
    let titulo = document.createElement("h3");

    titulo.innerText = "CARRITO DE COMPRAS"
    totales.innerText = "TOTAL CARRITO: $ 0.00"

    carrito.append(titulo);

    let botonConfirmar = document.createElement("button");
    botonConfirmar.innerHTML = "CONFIRMAR COMPRA";
    carritoCompras.append(botonConfirmar);
    botonConfirmar.classList.add("botonesConfirmar");
    
    botonConfirmar.addEventListener("click", () => {
        confirmarCompra(productosCarrito);
       }     )
    
    document.getElementById("encabezadoCarrito").className = "carrito";
    document.getElementById("totales").className = "totales";
}

function dibujarDivComprasRealizadas(){
    
    let encabezado = document.getElementById("encabezadoComprasRealizadas")
    let totalCompras = document.getElementById("totalesComprasRealizadas");    
    let contenedorComprasRealizadas = document.getElementById("comprasRealizadas"); 

    let titulo = document.createElement("h3");
    titulo.innerText = "COMPRAS REALIZADAS"
    encabezado.append(titulo);

    
    let totales = document.createElement("h3");
    totales.innerText = "TOTAL COMPRA: $ 0.00"
    totalCompras.append(totales);
    
    document.getElementById("encabezadoComprasRealizadas").className = "carrito";
    document.getElementById("totalesComprasRealizadas").className = "totales";
}

//función que trae los productos y cantidad de personas seleccionadas 
//del Storage
function traerProductosLocalStorage(){
    let itemsFromStorage = localStorage.getItem('carrito');
    let comprasRealizadasStorage = localStorage.getItem('productosCompras');
    let cajaTextoCantPersonas = document.getElementById("cantidadPersonas");
    cajaTextoCantPersonas.value = localStorage.getItem('cantidadPersonas');

    let optButtonSelect = localStorage.getItem('optSelect')
    let optSelectL = document.getElementById(optButtonSelect)
    
    optSelectL.checked = true

    let items = JSON.parse( itemsFromStorage );
    
    if (itemsFromStorage){
        items.forEach(items => {
           productosCarrito.push(items);
         })
    }

    let prodComprasRealizadas = JSON.parse( comprasRealizadasStorage );

    if (comprasRealizadasStorage){
        prodComprasRealizadas.forEach(items => {
            productosComprasRealizadas.push(items);
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

function borrarLocalStorageCarrito(){
    localStorage.removeItem('carrito');
}

function mostrarFiltros(){
    i = 0
    let divCantPersonas = document.getElementById("cantPersonas");

    for (let value of list) {  
        
       chk = document.createElement('input'); 
        chk.setAttribute('type', 'radio');   
        chk.setAttribute('id', 'chk' + i);
        chk.setAttribute('name', 'radioButton');

        chk.classList.add("checkBox");

        let lbl = document.createElement('label');  
        lbl.setAttribute('for', 'value' + i);

        lbl.appendChild(document.createTextNode(value));

        divCantPersonas.appendChild(chk);
        divCantPersonas.appendChild(lbl);
        i = i + 1;
        chk.addEventListener("click", () => {        
            mostrarProductosDisponibles();
           })
    }

    chk3.checked = true
}

//Cargo y muestro productos disponibles que se encuentran en archivo JSON (productos.json)
cargarProductosJSON();

//llamo función que prepara el div donde se van a mostrar los productos del carrito
dibujarDivCarrito();

//Muestro compras realizadas
dibujarDivComprasRealizadas()

//Muestro filtros 
mostrarFiltros();

//llama función que trae los datos (Productos, Cant. de personas ingresada y opción criterio seleccionada) del Storage
traerProductosLocalStorage();

//muestra los productos que ha seleccionado el usuario
mostrarProductosSeleccionados();

//muestra las compras realizadas por el usuario
mostrarComprasRealizadas();









 






 
    
 

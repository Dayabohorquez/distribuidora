import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Headerc from '../components/Header.c';
import '../index.css';

const ProductPage = ({ addToCart }) => {
    const [products, setProducts] = useState([]); 
    const [modalData, setModalData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [filters, setFilters] = useState({
        occasion: '',
        price: null,
        type: ''
    });
    const [notification, setNotification] = useState(''); 

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setIsAuthenticated(!!decoded.rol);
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/productos/fecha-especial/2'); // Cambia el ID según sea necesario
                setProducts(response.data);
            } catch (error) {
            }
        };

        fetchProducts();
    }, []);

    const handleDetailsClick = (product) => {
        setModalData({
            imgSrc: product.foto_ProductoURL || '',
            title: product.nombre_producto || 'Producto sin nombre',
            price: product.precio_producto,
            description: product.descripcion_producto || 'Descripción del producto no disponible.',
            id: product.id_producto 
        });
    };

    const handlePersonalizeClick = (product) => {
        navigate(`/producto/${product.id_producto}`, { state: { product } });
    };

    const handleFilterChange = (e) => {
        const { id, checked } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [id]: checked ? id : ''
        }));
    };

    const filteredProducts = products.filter(product => {
        const { occasion, price, type } = filters;
        const matchOccasion = !occasion || product.ocasion === occasion;
        const matchPrice = !price || 
            (price === 'below-100' && product.precio_producto < 100000) ||
            (price === 'between-100-200' && product.precio_producto >= 100000 && product.precio_producto <= 200000) ||
            (price === 'above-200' && product.precio_producto > 200000);
        const matchType = !type || product.tipo_flor === type;

        return matchOccasion && matchPrice && matchType;
    });

    const handleAddToCart = async (product) => {
        const documento = localStorage.getItem('documento');
        if (!documento) {
            setNotification('Por favor, inicie sesión para agregar productos al carrito.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:4000/api/carritos', {
                documento: documento,
                id_producto: product.id_producto,
                cantidad: 1
            });

            if (response.status === 200 || response.status === 201) {
                addToCart({
                    id: product.id_producto,
                    title: product.nombre_producto,
                    price: product.precio_producto,
                    img: product.foto_ProductoURL,
                    quantity: 1
                });
                setNotification(`Producto agregado al carrito! Subtotal: ${response.data.subtotal}`);
            } else {
                throw new Error('Error inesperado al agregar al carrito');
            }
        } catch (error) {
            setNotification('Error al agregar producto al carrito. Detalles: ' + error.message);
        }
    };

    const handleAddToCartFromModal = () => {
        if (modalData) {
            handleAddToCart(modalData);
            setModalData(null); 
        }
    };

    return (
        <div>
            {isAuthenticated ? <Headerc /> : <Header />}
            <div className="container">
                {notification && <div className="notification">{notification}</div>} 
                <aside className="sidebar">
                    <h2>
                        <a href="/" className="home-link">
                            <i className="fa-solid fa-house"></i>
                        </a> / Boda
                    </h2>
                    <div className="filter">
                        <h3>Ocasión</h3>
                        <ul>
                            <li><input type="checkbox" id="Amor y Amistad" onChange={handleFilterChange} /> Amor y Amistad</li>
                            <li><input type="checkbox" id="Cumpleaños" onChange={handleFilterChange} /> Cumpleaños</li>
                            <li><input type="checkbox" id="Dia de la Madre" onChange={handleFilterChange} /> Día de la Madre</li>
                        </ul>
                    </div>
                    <div className="filter">
                        <h3>Precio</h3>
                        <ul>
                            <li><input type="checkbox" id="below-100" onChange={handleFilterChange} /> Inferior a $100.000</li>
                            <li><input type="checkbox" id="between-100-200" onChange={handleFilterChange} /> Entre $100.000 - $200.000</li>
                            <li><input type="checkbox" id="above-200" onChange={handleFilterChange} /> Superior a $200.000</li>
                        </ul>
                    </div>
                    <div className="filter">
                        <h3>Tipo de Flor</h3>
                        <ul>
                            <li><input type="checkbox" id="Rosas" onChange={handleFilterChange} /> Rosas</li>
                            <li><input type="checkbox" id="Tropical" onChange={handleFilterChange} /> Flores Tropicales</li>
                            <li><input type="checkbox" id="Surtido" onChange={handleFilterChange} /> Flores Surtidas</li>
                        </ul>
                    </div>
                </aside>

                <main className="product-grid2">
                    {filteredProducts.map(product => (
                        <div key={product.id_producto} className="product-card">
                            <img src={product.foto_ProductoURL || ''} alt={product.nombre_producto} className="product-img" />
                            <h3>{product.nombre_producto}</h3>
                            <p>${product.precio_producto?.toLocaleString() || '0'}</p>
                            <button className="btn-details" onClick={() => handleDetailsClick(product)}>Ver detalles</button>
                            <button className="btn-details personalizar" onClick={() => handlePersonalizeClick(product)}>Personalizar</button>
                            <button className="btn-cart" onClick={() => handleAddToCart(product)}>Añadir al carrito</button>
                        </div>
                    ))}
                </main>

                {modalData && (
                    <div id="product-modal" className="modal" style={{ display: 'flex' }}>
                        <div className="modal-content">
                            <span className="close-modal" onClick={() => setModalData(null)}>&times;</span>
                            <div className="modal-body">
                                <img id="modal-img" src={modalData.imgSrc} alt="Producto" className="modal-img" />
                                <div className="modal-text">
                                    <h3 id="modal-title">{modalData.title}</h3>
                                    <p id="modal-description">{modalData.description}</p>
                                    <p id="modal-price">${modalData.price?.toLocaleString()}</p>
                                    <button className="btn-cart" onClick={handleAddToCartFromModal}>Añadir al carrito</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <a 
                href="https://wa.me/3222118028" 
                className="whatsapp-btn" 
                target="_blank" 
                rel="noopener noreferrer"
            >
                <FaWhatsapp size={30} />
            </a>
            <Footer />
        </div>
    );
};

export default ProductPage;

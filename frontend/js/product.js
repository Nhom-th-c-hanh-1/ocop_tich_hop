const token = localStorage.getItem('ocopToken');

const response = await fetch('http://localhost:3000/api/products', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.message || 'Không tải được sản phẩm');
}

console.log(data);
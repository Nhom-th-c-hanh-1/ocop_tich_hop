const db = require('../config/db');
const { getScope } = require('../utils/ownership');

const TABLE = 'co_so_san_xuat';
const KEY = 'MaCoSo';

// Đọc danh sách cột thật của bảng
async function getColumns() {
    const [rows] = await db.query(`SHOW COLUMNS FROM ${TABLE}`);
    return rows;
}

// Chỉ lấy các trường client gửi lên mà bảng thực sự có.
// Bỏ qua khóa chính và các cột khóa ngoại/chủ sở hữu (bắt đầu bằng "Ma" hoặc "owner")
// để không ai tự đổi được liên kết dữ liệu qua API này.
function pickFields(body, columns) {
    const data = {};
    for (const col of columns) {
        const name = col.Field;
        if (col.Key === 'PRI') continue;
        if (/^ma/i.test(name) || /^owner/i.test(name)) continue;
        if (Object.prototype.hasOwnProperty.call(body, name)) {
            const v = body[name];
            data[name] = v === '' || v === undefined ? null : v;
        }
    }
    return data;
}

// Cơ sở sản xuất chỉ được thao tác trên cơ sở của chính mình, admin thì không bị giới hạn
async function canManageCoSo(req, id) {
    const scope = await getScope(req);
    if (!scope.restricted) return true;
    return scope.maCoSo !== null && String(scope.maCoSo) === String(id);
}

// Lấy danh sách (mọi người đã đăng nhập xem được)
exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM ${TABLE} ORDER BY ${KEY} DESC`);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Lỗi lấy danh sách cơ sở:', error);
        res.status(500).json({ success: false, message: 'Không thể lấy danh sách cơ sở' });
    }
};

// Lấy chi tiết
exports.getById = async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM ${TABLE} WHERE ${KEY} = ?`, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Lỗi lấy chi tiết cơ sở:', error);
        res.status(500).json({ success: false, message: 'Không thể lấy thông tin cơ sở' });
    }
};

// Thêm mới (route chỉ cho admin)
exports.create = async (req, res) => {
    try {
        const columns = await getColumns();
        const data = pickFields(req.body, columns);

        const hasName = columns.some(c => c.Field === 'TenCoSo');
        if (hasName && (!data.TenCoSo || !String(data.TenCoSo).trim())) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tên cơ sở' });
        }

        const fields = Object.keys(data);
        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có dữ liệu hợp lệ để thêm' });
        }

        const [result] = await db.query(
            `INSERT INTO ${TABLE} (${fields.join(', ')})
             VALUES (${fields.map(() => '?').join(', ')})`,
            fields.map(f => data[f])
        );

        res.status(201).json({ success: true, message: 'Thêm thành công', id: result.insertId });
    } catch (error) {
        console.error('Lỗi thêm cơ sở:', error);
        res.status(500).json({ success: false, message: 'Không thể thêm cơ sở' });
    }
};

// Cập nhật
exports.update = async (req, res) => {
    try {
        if (!(await canManageCoSo(req, req.params.id))) {
            return res.status(403).json({ success: false, message: 'Bạn chỉ được sửa thông tin cơ sở của mình.' });
        }

        const columns = await getColumns();
        const data = pickFields(req.body, columns);

        if ('TenCoSo' in data && (!data.TenCoSo || !String(data.TenCoSo).trim())) {
            return res.status(400).json({ success: false, message: 'Tên cơ sở không được để trống' });
        }

        const fields = Object.keys(data);
        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có dữ liệu hợp lệ để cập nhật' });
        }

        const [result] = await db.query(
            `UPDATE ${TABLE}
             SET ${fields.map(f => `${f} = ?`).join(', ')}
             WHERE ${KEY} = ?`,
            [...fields.map(f => data[f]), req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở' });
        }

        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật cơ sở:', error);
        res.status(500).json({ success: false, message: 'Không thể cập nhật cơ sở' });
    }
};

// Xóa (route chỉ cho admin)
exports.delete = async (req, res) => {
    try {
        const [result] = await db.query(`DELETE FROM ${TABLE} WHERE ${KEY} = ?`, [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở' });
        }

        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        console.error('Lỗi xóa cơ sở:', error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'Không thể xóa cơ sở đang có vùng nguyên liệu, sản phẩm hoặc tài khoản liên kết.'
            });
        }

        res.status(500).json({ success: false, message: 'Không thể xóa cơ sở' });
    }
};

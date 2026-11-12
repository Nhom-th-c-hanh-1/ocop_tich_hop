NHÓM 3: HỆ THỐNG TRUY XUẤT NGUỒN GỐC NÔNG SẢN 
OCOP 
1. Những khó khăn trong quá trình quản lý sản phẩm OCOP: 
Khó khăn lớn nhất là dữ liệu sản xuất thường phân tán và trình độ công 
nghệ của các HTX, nông hộ còn hạn chế nên việc nhập liệu và cập nhật 
thường xuyên gặp nhiều trở ngại. Bên cạnh đó, hệ thống phải đồng bộ 
dữ liệu giữa nhiều tác nhân như cơ sở sản xuất, cán bộ kiểm định, cơ 
quan quản lý và admin, đòi hỏi phân quyền chặt chẽ. Ngoài ra, nếu 
không quản lý theo lô sản xuất thì rất khó truy vết và thu hồi đúng sản 
phẩm khi có sự cố về an toàn thực phẩm. 
2. Các tác nhân của hệ thống: 
Hệ thống được thiết kế phục vụ 5 tác nhân gồm: Quản trị viên (Admin) 
quản lý toàn bộ hệ thống; Cơ sở sản xuất (HTX/Nông hộ) khai báo hồ 
sơ, tạo lô và sinh mã QR; Cán bộ kiểm định cập nhật kết quả kiểm tra 
chất lượng và cấp chứng nhận; Cơ quan quản lý (Sở/Ngành) theo dõi 
báo cáo và hậu kiểm; và Người tiêu dùng ẩn danh chỉ quét mã QR để tra 
cứu, không cần tài khoản. 
3. Có tra cứu được mã không: 
Có. Cơ sở sản xuất sinh mã QR cho từng lô sản xuất, người tiêu dùng 
quét mã để xem thông tin nguồn gốc. Tuy nhiên, chức năng quét QR 
bằng camera và lấy dữ liệu trực tiếp từ database hiện đang trong giai 
đoạn kiểm thử, nhóm chưa khẳng định là đã hoàn thiện hoàn toàn. 
4. Có mua được sản phẩm không: 
Không. Hệ thống tập trung vào truy xuất nguồn gốc, không có module 
thương mại điện tử như giỏ hàng hay thanh toán. Người dùng chỉ có thể 
liên hệ trực tiếp với cơ sở sản xuất qua số điện thoại hoặc Zalo được 
hiển thị trên trang tra cứu nếu có nhu cầu mua hàng. 
5. Có đăng ký tài khoản cho khách hàng được không: 
Trong thiết kế đã thống nhất, người tiêu dùng là tác nhân ẩn danh, không 
cần đăng ký tài khoản, chỉ cần quét mã QR là xem được thông tin. Tài 
khoản chỉ cấp cho 4 tác nhân vận hành hệ thống. Nếu sau này mở rộng, 
nhóm có thể bổ sung tác nhân Khách hàng để lưu lịch sử tra cứu. 
6. Nếu sản phẩm bị thu hồi, hết hạn sử dụng có xóa được không: 
Không nên xóa cứng dữ liệu. Hệ thống sử dụng cơ chế chuyển trạng thái 
lô sản xuất sang Thu hồi hoặc Hết hạn, giữ nguyên dữ liệu để đảm bảo 
truy vết. Khi người dùng quét mã lô đó, hệ thống sẽ hiển thị cảnh báo 
thay vì thông tin bình thường. 
7. Sản phẩm hướng đến người sử dụng là ai: 
Sản phẩm hướng đến người tiêu dùng cuối là những người quan tâm đến 
an toàn thực phẩm và nguồn gốc sản phẩm. Đồng thời hệ thống cũng 
phục vụ nông hộ, HTX trong việc số hóa quy trình sản xuất và cơ quan 
quản lý trong công tác hậu kiểm, truy vết. 
8. Nhóm có chứng minh được hàng chính hãng không: 
Có. Hệ thống có chức năng kiểm định chất lượng do cán bộ kiểm định 
thực hiện và cấp chứng nhận OCOP kèm số sao, file PDF hoặc ảnh đính 
kèm. Khi người dùng quét mã QR, các thông tin chứng nhận này được 
hiển thị công khai, là căn cứ để chứng minh sản phẩm chính hãng. 
9. Những thông tin nào được hiển thị khi quét mã QR: 
Khi quét mã QR, hệ thống hiển thị các thông tin gồm: tên sản phẩm, số 
sao OCOP, mã lô, ngày sản xuất, hạn sử dụng, trạng thái lô, tên và địa 
chỉ cơ sở sản xuất, vùng nguyên liệu kèm bản đồ, nhật ký sản xuất dạng 
timeline, kết quả kiểm định và chứng nhận đính kèm. 
10. Nếu sản phẩm bị làm giả nhưng khi quét mã vẫn là chính hãng 
thì xử lý như thế nào: 
Đây là điểm nhóm đang bổ sung trong thiết kế. Giải pháp dự kiến là sử 
dụng mã QR động one-time hoặc mã PIN cào, mỗi tem chỉ kích hoạt 
được một lần. Nếu mã đã được quét trước đó, hệ thống sẽ cảnh báo sản 
phẩm có dấu hiệu bị làm giả. Ngoài ra, trên trang tra cứu sẽ có nút Báo 
cáo hàng giả để người dùng gửi ảnh nghi vấn về cho Admin xử lý. 

const termAdmin = VideoContentAdmin.create({
  collectionName: "explainCards",
  categoryType: "term",
  titleField: "termName",
  thumbField: "termThumb",
  titleInputId: "termName",
  thumbInputId: "termThumb",
  titleLabel: "Tên thuật ngữ",
  itemLabelLower: "thuật ngữ",
  addModalTitle: "Thêm thuật ngữ",
  editModalTitle: "Sửa thuật ngữ",
  deleteConfirmMessage: "Bạn có chắc muốn xóa thuật ngữ này không?",
  noCategoryMessage:
    "Chưa có category type term. Hãy thêm category trước.",
});

function pageInit() {
  termAdmin.initPage();
}

const caseStudyVideoAdmin = VideoContentAdmin.create({
  collectionName: "caseStudyVideos",
  categoryType: "case_study_video",
  titleField: "title",
  thumbField: "thumbnail",
  titleInputId: "title",
  thumbInputId: "thumbnail",
  titleLabel: "Tiêu đề",
  itemLabelLower: "case study video",
  addModalTitle: "Thêm case study video",
  editModalTitle: "Sửa case study video",
  deleteConfirmMessage: "Bạn có chắc muốn xóa case study video này không?",
  noCategoryMessage:
    "Chưa có category type case_study_video. Hãy thêm category trước.",
});

function pageInit() {
  caseStudyVideoAdmin.initPage();
}

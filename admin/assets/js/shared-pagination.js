function createPagination({
    items = [],
    currentPage = 1,
    itemsPerPage = 10,
    paginationId = "pagination",
    paginationInfoId = "paginationInfo",
    itemName = "items",
    onPageChange = () => {}
}) {
    const pagination = document.getElementById(paginationId);
    const paginationInfo = document.getElementById(paginationInfoId);

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage > totalPages) {
        currentPage = 1;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedItems = items.slice(startIndex, endIndex);

    pagination.innerHTML = "";

    if (paginationInfo) {
        paginationInfo.innerText =
            totalItems === 0
                ? `0 / 0 ${itemName}`
                : `${Math.min(totalItems, startIndex + 1)} - ${Math.min(endIndex, totalItems)} / ${totalItems} ${itemName}`;
    }

    if (totalPages <= 1) {
        return {
            paginatedItems,
            totalPages,
            currentPage
        };
    }

    pagination.innerHTML += `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <button class="page-link" data-page="${currentPage - 1}">
                Prev
            </button>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${currentPage === i ? "active" : ""}">
                <button class="page-link" data-page="${i}">
                    ${i}
                </button>
            </li>
        `;
    }

    pagination.innerHTML += `
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <button class="page-link" data-page="${currentPage + 1}">
                Next
            </button>
        </li>
    `;

    pagination.querySelectorAll(".page-link").forEach((button) => {
        button.addEventListener("click", () => {
            const page = Number(button.dataset.page);

            if (
                page < 1 ||
                page > totalPages ||
                page === currentPage
            ) {
                return;
            }

            onPageChange(page);
        });
    });

    return {
        paginatedItems,
        totalPages,
        currentPage
    };
}
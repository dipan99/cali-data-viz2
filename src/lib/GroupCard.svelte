<script>
    export let modalId = "groupModal";

    let groupMembers = [
        { name: "Dipan Bag", id: "bag00003" },
        { name: "Aarav Kalkar", id: "kalka046" },
        { name: "Marc Scanlan", id: "scanl187" },
        { name: "Brandt Kringlie", id: "kring089" },
        { name: "Shane Lentsch", id: "lents084" },
    ];

    let sortedMembers = [...groupMembers].sort((a, b) =>
        a.name.localeCompare(b.name)
    );
</script>

<div class="modal fade" id={modalId} tabindex="-1" aria-labelledby="modalTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalTitle">Group Members</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <ul class="list-group list-group-flush">
                    {#each sortedMembers as member}
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <strong>{member.name}</strong>
                            <span class="badge bg-secondary">{member.id}</span>
                        </li>
                    {/each}
                </ul>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<style>
    .modal-content {
        border-radius: 10px;
        overflow: hidden;
    }

    .modal-header {
        text-align: center;
    }

    .list-group-item {
        font-size: 1rem;
    }
</style>
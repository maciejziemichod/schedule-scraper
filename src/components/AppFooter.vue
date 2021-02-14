<template>
    <footer>
        <div class="content">
            <a
                href="https://github.com/maciejziemichod/schedule-scraper"
                target="_blank"
                rel="noopener noreferrer"
            >
                <FontAwesomeIcon :icon="['fab', 'github']" class="fa-lg" />
            </a>
            <!-- <p>here will be link to desktop version</p> -->
        </div>
    </footer>
</template>

<script>
export default {};
</script>

<style scoped>
footer {
    position: absolute;
    bottom: 0;
    width: calc(100% - (var(--container-padding) * 2));
    padding-bottom: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    text-align: center;
}
p {
    font-size: 0.7rem;
}
</style>
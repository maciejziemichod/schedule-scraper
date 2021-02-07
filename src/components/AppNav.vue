<template>
    <nav>
        <slot></slot>
    </nav>
</template>

<script>
export default {};
</script>

<style >
nav {
    height: 3rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 2rem;
}
nav > * {
    margin: 0 2rem;
}
</style>
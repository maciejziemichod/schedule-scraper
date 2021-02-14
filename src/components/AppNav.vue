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
}
nav > * {
    margin: 0 2rem;
}
nav > *:first-child {
    margin-left: 0;
}
nav > *:last-child {
    margin-right: 0;
}
</style>
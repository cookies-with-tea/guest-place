<template>
	<div class="main-layout">
		<div class="main-layout__content-wrapper">
			<div class="main-layout__content">
        <header>host header</header>
				<router-view />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.main-layout {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;

	&__content {
		flex-grow: 1;
		padding-bottom: 100px;
	}

	&__content-wrapper {
		width: 100%;
		max-width: 1920px;
		display: flex;
		flex-grow: 1;
	}
}
</style>

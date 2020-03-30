<main class="main bg-custom-template <?php print ! empty( $sidebar_location ) ? $sidebar_location : ''?>"
	role="main">
	<div class="bge-content-main">
		<article id="post-<?php the_ID(); ?>" <?php post_class( 'bg-page-article' ); ?>>
			<?php
			the_post();

			if ( Boldgrid_Editor_Service::get( 'page_title' )->has_title_displayed() && get_the_title() ) { ?>
				<header class="container entry-header">
					<h1 class="entry-title"><?php the_title(); ?></h1>
				</header>
			<?php } ?>

			<div class="bge-entry-content">
				<?php the_content(); ?>
			</div>
			<?php include( __DIR__ . '/entry-footer.php' ); ?>
		</article>

		<?php include( __DIR__ . '/wp-link-pages.php' ); ?>
	</div>
	<?php if ( ! empty( $sidebar_location ) ) { ?>
	<div class="bge-sidebar">
		<?php do_action( 'boldgrid_editor_sidebar' ); ?>
	</div>
	<?php } ?>
</main>

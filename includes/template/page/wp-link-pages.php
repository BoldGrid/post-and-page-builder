<?php
$links = wp_link_pages( array(
	'echo' => 0
) );

if ( $links ) { ?>
	<div class="boldgrid-section">
		<div class="container">
			<?php echo $links; ?>
		</div>
	</div>
<?php }

<div class="page" id="page">
  <a href=""><img src="../../_assets/src/logo.png" class="logo" alt="Logo Alt Text"></a><section class="section hoagies">
    <h2 class="section-title"></h2>
    <ul class="post-list">
      <?php foreach ($latest_posts as $post): ?>
        <li><?php print $post; ?></li>
      <?php endforeach; ?>
    </ul>
    <a href="#" class="text-btn">View more posts</a>
  </section>
  <?php print $page['footer']; ?>
</div>

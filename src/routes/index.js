<!DOCTYPE html>
<html lang="fr" class="h-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Système de gestion ENI - Plateforme de gestion scolaire complète">
  <meta name="keywords" content="ENI, Gestion scolaire, Éducation, Formation">
  <meta name="author" content="ENI Abomey">
  
  <!-- Primary Meta Tags -->
  <title><%= title %> | ENI Gestion Scolaire</title>
  <meta name="title" content="<%= title %> | ENI Gestion Scolaire">
  
  <!-- Favicon & Apple Touch Icons -->
  <link rel="icon" href="/images/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
  
  <!-- CSS Libraries -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
  
  <!-- Custom CSS -->
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/utilities.css">
  
  <!-- Page-specific CSS -->
  <% if (stylesheets) { %>
    <% stylesheets.forEach(css => { %>
      <link rel="stylesheet" href="<%= css %>">
    <% }); %>
  <% } %>
  
  <!-- Preload Critical Resources -->
  <link rel="preload" href="/images/logo-eni.png" as="image">
  <link rel="preload" href="/css/main.css" as="style">
</head>
<body class="d-flex flex-column h-100">
  <!-- Header -->
  <%- include('../partials/header') %>
  
  <!-- Navigation -->
  <%- include('../partials/navigation') %>

  <!-- Main Content -->
  <main class="flex-shrink-0">
    <div class="container py-4">
      <%- include('../partials/alerts') %>
      <%- body %>
    </div>
  </main>

  <!-- Footer -->
  <%- include('../partials/footer') %>

  <!-- JavaScript Libraries -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
          integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" 
          crossorigin="anonymous"></script>
  
  <!-- Custom JavaScript -->
  <script src="/js/main.js" defer></script>
  
  <!-- Page-specific JS -->
  <% if (scripts) { %>
    <% scripts.forEach(js => { %>
      <script src="<%= js %>" defer></script>
    <% }); %>
  <% } %>
  
  <!-- Analytics (optionnel) -->
  <script>
    if (window.location.hostname === 'eni-abomey.bj') {
      // Intégration Google Analytics
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-XXXXX-Y', 'auto');
      ga('send', 'pageview');
    }
  </script>
</body>
</html>

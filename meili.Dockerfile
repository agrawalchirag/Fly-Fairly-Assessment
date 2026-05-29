FROM getmeili/meilisearch:v1.12
EXPOSE 7700
# Render routes traffic to the port the service binds to.
# Meilisearch uses MEILI_HTTP_ADDR to set its listen address.
ENV MEILI_HTTP_ADDR="0.0.0.0:7700"
CMD ["meilisearch"]

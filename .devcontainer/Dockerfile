# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.163.1/containers/javascript-node/.devcontainer/base.Dockerfile

ARG VARIANT="14-buster"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

ARG EXTRA_NODE_VERSION=16
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

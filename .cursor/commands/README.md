# Cursor Commands - Reusable Workflows

This directory contains reusable workflow commands for common development tasks.

## 📋 Available Commands

### Setup Commands

1. **[Setup Project](./setup-project.md)** - Initial project setup workflow
   - Clone repository
   - Install dependencies
   - Configure environment
   - Setup database
   - Verify installation

2. **[Setup Cloudflare](./setup-cloudflare.md)** - Cloudflare R2 and Images setup
   - Create R2 bucket
   - Configure API tokens
   - Setup public access
   - Configure Cloudflare Images
   - Environment variables

3. **[Setup Security](./setup-security.md)** - Security configuration
   - Generate application token
   - Configure JWT secret
   - Setup RBAC
   - Verify security setup

4. **[Setup Monitoring](./setup-monitoring.md)** - Prometheus and Grafana setup
   - Start monitoring stack
   - Configure Prometheus
   - Setup Grafana dashboards
   - Generate sample metrics

5. **[Setup API Documentation](./setup-api-docs.md)** - Swagger/OpenAPI setup
   - Access Swagger UI
   - Authorize endpoints
   - Export OpenAPI spec
   - Import to Postman

### Management Commands

6. **[Database Management](./database-management.md)** - Database operations
   - Reset database
   - Seed data
   - Backup/restore
   - Migrations

7. **[Development Workflow](./development-workflow.md)** - Daily development tasks
   - Start/stop servers
   - Linting and formatting
   - Testing
   - Git workflow
   - Debugging

8. **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions
   - Authentication issues
   - Database issues
   - Image upload issues
   - API issues
   - Build issues
   - Performance issues

## 🚀 Quick Start

### New Developer Setup

1. **Initial Setup**: Follow [Setup Project](./setup-project.md)
2. **Security**: Follow [Setup Security](./setup-security.md)
3. **Optional**: Follow [Setup Cloudflare](./setup-cloudflare.md) for image handling
4. **Optional**: Follow [Setup Monitoring](./setup-monitoring.md) for metrics

### Daily Development

- **Start Development**: See [Development Workflow](./development-workflow.md)
- **Database Operations**: See [Database Management](./database-management.md)
- **Troubleshooting**: See [Troubleshooting](./troubleshooting.md)

## 📚 Usage

These commands are designed to be used with Cursor IDE's command palette:

1. Open Cursor IDE
2. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Cursor: Run Command"
4. Select the command file you want to use

Or simply open the `.md` file and follow the instructions.

## 🔗 Related Documentation

- **Coding Guidelines**: See `.cursor/rules`
- **Project Documentation**: See `docs/`
- **API Documentation**: See `docs/API/`
- **Enterprise Features**: See `docs/enterprise/`

## 💡 Tips

- **Bookmark**: Bookmark frequently used commands
- **Customize**: Modify commands to fit your workflow
- **Share**: Share custom commands with your team
- **Update**: Keep commands updated with project changes

## 📝 Command Structure

Each command file follows this structure:

1. **Purpose**: What the command does
2. **Prerequisites**: What you need before starting
3. **Steps**: Step-by-step instructions
4. **Verification**: How to verify it worked
5. **Troubleshooting**: Common issues and solutions
6. **Documentation**: Links to related docs

## 🎯 Best Practices

1. **Read First**: Read the entire command before starting
2. **Follow Order**: Follow steps in order
3. **Verify**: Verify each step before proceeding
4. **Document**: Document any customizations
5. **Update**: Update commands when project changes

## 🤝 Contributing

To add a new command:

1. Create a new `.md` file in `.cursor/commands/`
2. Follow the existing command structure
3. Update this README with the new command
4. Test the command thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:

1. Check [Troubleshooting](./troubleshooting.md)
2. Review project documentation in `docs/`
3. Check GitHub issues
4. Ask in team chat

---

**Last Updated**: 2025-11-06
